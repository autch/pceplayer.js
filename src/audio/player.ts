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

// 出力レートを固定して、どの端末でも同じ PCM になるようにする (ブラウザが再サンプリングする)
const SAMPLE_RATE = 48000;

export type PlayerState = 'stopped' | 'loading' | 'playing';

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
    #analyser: AnalyserNode | null = null;
    #state: PlayerState = 'stopped';
    #now: NowPlaying | null = null;
    #id = 0;
    #cache = new Map<string, Uint8Array>();

    get state(): PlayerState {
        return this.#state;
    }

    /** 演奏中 (または読み込み中) の曲。停止中は null */
    get nowPlaying(): NowPlaying | null {
        return this.#now;
    }

    /** 出力波形を見るための AnalyserNode。一度も再生していなければ null */
    get analyser(): AnalyserNode | null {
        return this.#analyser;
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

        this.#analyser = new AnalyserNode(ctx, { fftSize: 2048 });
        node.connect(this.#analyser).connect(ctx.destination);
        return node;
    }

    #onMessage(msg: FromProcessor) {
        if (msg.id !== this.#id) return;   // 古い曲からの通知
        switch (msg.type) {
            case 'started':
                if (this.#now) this.#set('playing', this.#now);
                break;
            case 'ended':
                this.#set('stopped', null);
                this.dispatchEvent(new Event('ended'));
                break;
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

    /** url の pmd を再生する。encoding はタイトルの文字コード */
    async play(url: string, encoding = 'shift_jis'): Promise<void> {
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
                title: decodeTitle(header.title, encoding),
                title2: decodeTitle(header.title2, encoding),
            });
            node.port.postMessage({ type: 'play', id, pmd } satisfies ToProcessor);
        } catch (e) {
            if (id !== this.#id) return;
            this.#fail(e);
        }
    }

    stop(): void {
        this.#id++;
        void this.#node?.then((node) => node.port.postMessage({ type: 'stop' } satisfies ToProcessor));
        this.#set('stopped', null);
    }
}
