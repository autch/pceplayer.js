// SPDX-License-Identifier: MIT
//
// pmd の再生を管理する。ページ内のすべての UI 部品で 1 つを共有し (PmdPlayer.shared)、
// 同時に鳴らすのは 1 曲だけにする。
//
// ブラウザの自動再生制限のため、play() は必ずクリックなどのユーザー操作の中から呼ぶこと。
// AudioContext の作成と resume() は play() の中で await より前に済ませている。

import wasmUrl from '../../vendor/muslib/muslib.wasm?url';
import processorUrl from './processor.ts?worker&url';
import { PROCESSOR_NAME, type FromProcessor, type ProcessorOptions, type ToProcessor } from './messages.ts';
import { decodeTitle, parsePmd } from '../pmd.ts';
import { bindMediaSession } from './media-session.ts';

// 出力レートを固定して、どの端末でも同じ PCM になるようにする (ブラウザが再サンプリングする)
const SAMPLE_RATE = 48000;

// 波形表示用に、合成した波形を最近の約 1.4 秒分 (48kHz で) ためておく
const RING_SIZE = 1 << 16;

export type PlayerState = 'stopped' | 'loading' | 'playing' | 'paused';

/** 一覧の前後の曲への移動 (OS の「前の曲」「次の曲」に使う) */
export interface TrackNavigation {
    previous(): void;
    next(): void;
}

const VOLUME_KEY = 'pceplayer.volume';

function loadVolume(): number {
    try {
        const v = Number(localStorage.getItem(VOLUME_KEY));
        return localStorage.getItem(VOLUME_KEY) !== null && v >= 0 && v <= 1 ? v : 0.8;
    } catch {
        return 0.8;
    }
}

export interface NowPlaying {
    url: string;
    title: string;
    title2: string;
}

export class PlayerError extends Error {}

export class PmdPlayer extends EventTarget {
    static #shared: PmdPlayer | undefined;

    /** ページ内で共有するインスタンス */
    static get shared(): PmdPlayer {
        return (PmdPlayer.#shared ??= new PmdPlayer());
    }

    #ctx: AudioContext | null = null;
    #node: Promise<AudioWorkletNode> | null = null;
    #gain: GainNode | null = null;
    #volume = loadVolume();
    #nav: { owner: object; nav: TrackNavigation } | null = null;
    #ring = new Float32Array(RING_SIZE);
    #ringEnd = 0;     // #ring に入っている最後のサンプルの次のフレーム番号。0 ならデータなし
    #state: PlayerState = 'stopped';
    #now: NowPlaying | null = null;
    #id = 0;
    #cache = new Map<string, Uint8Array>();

    constructor() {
        super();
        bindMediaSession(this);
    }

    get state(): PlayerState {
        return this.#state;
    }

    /** 音量 (0〜1)。ページをまたいで覚えておく。変わると 'volumechange' を出す */
    get volume(): number {
        return this.#volume;
    }

    set volume(v: number) {
        v = Math.min(1, Math.max(0, v));
        if (v === this.#volume) return;
        this.#volume = v;
        this.#applyVolume();
        try {
            localStorage.setItem(VOLUME_KEY, String(v));
        } catch {
            // 保存できなくても、このページの中では効く
        }
        this.dispatchEvent(new Event('volumechange'));
    }

    #applyVolume() {
        // 耳の感じ方に合わせて 2 乗で効かせる
        if (this.#gain) this.#gain.gain.value = this.#volume * this.#volume;
    }

    /** 前後の曲への移動。一覧の部品が、自分の曲を演奏しているあいだだけ登録する */
    get trackNavigation(): TrackNavigation | null {
        return this.#nav?.nav ?? null;
    }

    setTrackNavigation(owner: object, nav: TrackNavigation | null) {
        if (nav) this.#nav = { owner, nav };
        else if (this.#nav?.owner === owner) this.#nav = null;
        else return;
        this.dispatchEvent(new Event('navigationchange'));
    }

    /** 演奏中 (または読み込み中) の曲。停止中は null */
    get nowPlaying(): NowPlaying | null {
        return this.#now;
    }

    /** オーディオのバッファによる遅延 (秒)。一度も再生していなければ 0 */
    get latency(): { base: number; output: number } {
        return { base: this.#ctx?.baseLatency ?? 0, output: this.#ctx?.outputLatency ?? 0 };
    }

    /**
     * いまスピーカーから出ている位置までの波形を out に書く (out.length サンプル分)。
     * 合成はオーディオ出力の都合でまとめて先に進むことがあるので、出力のタイムスタンプで
     * 再生位置を求めて切り出す。波形がまだなければ false
     */
    waveform(out: Float32Array): boolean {
        const ctx = this.#ctx;
        if (!ctx || !this.#ringEnd) return false;
        // getOutputTimestamp() の値はオーディオの処理のたびにしか更新されないので、
        // 取得した時刻 (performanceTime) からの経過時間を足して今の再生位置を推定する
        const ts = ctx.getOutputTimestamp?.();
        const t = ts?.contextTime && ts.performanceTime
            ? ts.contextTime + (performance.now() - ts.performanceTime) / 1000
            : ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
        // 推定が合成済みの範囲を越えたら、届いている最後の位置で止める
        const end = Math.min(Math.floor(t * ctx.sampleRate), this.#ringEnd);
        const start = end - out.length;
        const oldest = this.#ringEnd - RING_SIZE;
        for (let i = 0; i < out.length; i++) {
            const f = start + i;
            out[i] = f >= 0 && f >= oldest && f < this.#ringEnd ? this.#ring[f & (RING_SIZE - 1)] : 0;
        }
        return true;
    }

    #storeWave(frame: number, samples: Float32Array) {
        for (let i = 0; i < samples.length; i++) this.#ring[(frame + i) & (RING_SIZE - 1)] = samples[i];
        this.#ringEnd = Math.max(this.#ringEnd, frame + samples.length);
    }

    #set(state: PlayerState, now: NowPlaying | null) {
        this.#state = state;
        this.#now = now;
        this.dispatchEvent(new Event('change'));
    }

    #context(): AudioContext {
        if (!this.#ctx) {
            // iOS の Safari は、消音スイッチ (サイレントモード) がオンだと Web Audio を鳴らさない。
            // Audio Session API (Safari 17+) で音楽再生として扱ってもらう
            const session = (navigator as { audioSession?: { type: string } }).audioSession;
            if (session) session.type = 'playback';
            try {
                this.#ctx = new AudioContext({ sampleRate: SAMPLE_RATE, latencyHint: 'playback' });
            } catch {
                this.#ctx = new AudioContext({ latencyHint: 'playback' });
            }
            // 電話の着信や、OS の一時停止ボタン (Media Session を使わない場合) などで
            // OS が止めたり再開したりしたときに、状態を合わせる
            const ctx = this.#ctx;
            ctx.addEventListener('statechange', () => {
                const s = ctx.state as string;
                if ((s === 'suspended' || s === 'interrupted') && this.#state === 'playing') {
                    this.#set('paused', this.#now);
                } else if (s === 'running' && this.#state === 'paused') {
                    this.#set('playing', this.#now);
                }
            });
        }
        return this.#ctx;
    }

    async #setup(ctx: AudioContext): Promise<AudioWorkletNode> {
        const [module] = await Promise.all([
            fetch(wasmUrl).then((r) => {
                if (!r.ok) throw new PlayerError(`再生エンジンを読み込めません (HTTP ${r.status})`);
                return r.arrayBuffer();
            }).then((b) => WebAssembly.compile(b)),
            ctx.audioWorklet.addModule(processorUrl),
        ]);
        const node = new AudioWorkletNode(ctx, PROCESSOR_NAME, {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
            processorOptions: { module } satisfies ProcessorOptions,
        });
        node.port.onmessage = (e: MessageEvent<FromProcessor>) => this.#onMessage(e.data);
        this.#gain = new GainNode(ctx);
        this.#applyVolume();
        node.connect(this.#gain).connect(ctx.destination);
        return node;
    }

    #onMessage(msg: FromProcessor) {
        if (msg.id !== this.#id) return;   // 古い曲からの通知
        switch (msg.type) {
            case 'wave':
                this.#storeWave(msg.frame, msg.samples);
                break;
            case 'started':
                if (this.#now) this.#set('playing', this.#now);
                break;
            case 'ended': {
                // 合成が終わっても、出力の遅延の分だけ音はまだ鳴っている (Android では 0.2 秒ほど)。
                // 鳴り終わるまで待ってから停止の状態にする
                const ctx = this.#ctx!;
                const id = msg.id;
                const delay = ((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * 1000;
                setTimeout(() => {
                    if (id !== this.#id) return;
                    this.#set('stopped', null);
                    this.dispatchEvent(new Event('ended'));
                }, delay);
                break;
            }
            case 'error':
                this.#fail(new PlayerError(msg.message));
                break;
        }
    }

    #fail(e: unknown) {
        this.#set('stopped', null);
        const message = e instanceof Error ? e.message : String(e);
        this.dispatchEvent(new CustomEvent('error', { detail: message }));
    }

    async #load(url: string): Promise<Uint8Array> {
        const cached = this.#cache.get(url);
        if (cached) return cached;
        let res: Response;
        try {
            res = await fetch(url);
        } catch {
            throw new PlayerError('曲データを読み込めません (ネットワークエラー)');
        }
        if (!res.ok) throw new PlayerError(`曲データを読み込めません (HTTP ${res.status})`);
        // URL の間違いでサーバが HTML のページを返したときに、それを鳴らさない
        if (res.headers.get('content-type')?.startsWith('text/html')) {
            throw new PlayerError('指定された URL は曲データではありません');
        }
        const data = new Uint8Array(await res.arrayBuffer());
        this.#cache.set(url, data);
        return data;
    }

    /**
     * この環境で再生できるか。AudioWorklet はセキュアコンテキスト (HTTPS か localhost) でしか
     * 使えないので、http:// で開いたページでは再生できない。
     */
    static get supported(): boolean {
        return window.isSecureContext && typeof AudioWorkletNode === 'function';
    }

    /** url の pmd を再生する */
    async play(url: string): Promise<void> {
        if (!PmdPlayer.supported) {
            this.#id++;
            this.#fail(new PlayerError(window.isSecureContext
                ? 'このブラウザでは再生できません (AudioWorklet に対応していません)'
                : 'このページでは再生できません。https:// で開いてください'));
            return;
        }
        const ctx = this.#context();
        void ctx.resume();
        const id = ++this.#id;
        this.#set('loading', { url, title: '', title2: '' });

        try {
            // 初期化に失敗したら次の play() でやり直す
            this.#node ??= this.#setup(ctx).catch((e) => {
                this.#node = null;
                throw e;
            });
            const [node, pmd] = await Promise.all([this.#node, this.#load(url)]);
            if (id !== this.#id) return;   // 読み込み中に別の曲が選ばれた

            const header = parsePmd(pmd);
            if (!header) throw new PlayerError('pmd として読めないデータです');
            this.#set('loading', {
                url,
                title: decodeTitle(header.title),
                title2: decodeTitle(header.title2),
            });
            this.#ring.fill(0);
            this.#ringEnd = 0;
            node.port.postMessage({ type: 'play', id, pmd } satisfies ToProcessor);
        } catch (e) {
            if (id !== this.#id) return;
            this.#fail(e);
        }
    }

    /** 一時停止する。合成もその場で止まり、resume() で続きから鳴る */
    pause(): void {
        if (this.#state !== 'playing' || !this.#ctx) return;
        this.#set('paused', this.#now);
        void this.#ctx.suspend();
    }

    /** 一時停止から再開する */
    resume(): void {
        if (this.#state !== 'paused' || !this.#ctx) return;
        this.#set('playing', this.#now);
        void this.#ctx.resume();
    }

    stop(): void {
        this.#id++;
        void this.#node?.then((node) => node.port.postMessage({ type: 'stop' } satisfies ToProcessor));
        // 一時停止中に止めたときは、次の曲のために AudioContext を動かしておく
        if (this.#ctx && this.#ctx.state !== 'running') void this.#ctx.resume();
        this.#set('stopped', null);
    }
}
