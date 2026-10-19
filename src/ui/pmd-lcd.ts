// SPDX-License-Identifier: MIT
//
// <pmd-lcd>: P/ECE の液晶を模した表示部。タイトル、サブタイトル、状態と、
// 実際に鳴っている波形を P/ECE の液晶と同じ横 128 ドットで描く。
//
// 属性:
//   transparent  背景を塗らない (本体スキャン画像の液晶部分に重ねるとき)

import { PmdPlayer, type PlayerState } from '../audio/player.ts';
import { tokens } from './style.ts';

const SCOPE_W = 128;
const SCOPE_H = 24;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ?fps を付けると、液晶に描画と波形データの更新の頻度を出す (端末ごとの見え方を調べるため)
const SHOW_FPS = new URLSearchParams(location.search).has('fps');

// ?fps のときは、OS の再生コントロールから届いた操作も出す
let lastMediaAction = '';
if (SHOW_FPS) {
    PmdPlayer.shared.addEventListener('mediaaction', (e) => {
        lastMediaAction = `${(e as CustomEvent<string>).detail} (${new Date().toLocaleTimeString()})`;
    });
}

const template = /* html */ `
<style>
    ${tokens}
    :host {
        display: block;
        container-type: inline-size;
    }
    .lcd {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: 0.6em;
        height: 100%;
        padding: 0.8em 0.9em;
        background: var(--pce-lcd);
        color: var(--pce-ink);
        font-family: var(--pce-font-lcd);
        line-height: 1.35;
        /* 反射型液晶のわずかなムラ */
        background-image: radial-gradient(ellipse at 30% 20%, rgb(255 255 255 / 0.07), transparent 60%);
    }
    :host([transparent]) .lcd { background: none; }
    .text { min-height: 0; overflow: hidden; }
    .title {
        margin: 0;
        font-size: clamp(14px, 7cqi, 22px);
        font-weight: normal;
        white-space: pre-line;
        overflow-wrap: anywhere;
    }
    .title2 {
        margin: 0.3em 0 0;
        font-size: clamp(11px, 4.6cqi, 15px);
        color: var(--pce-ink);
        opacity: 0.8;
        white-space: pre-line;
        overflow-wrap: anywhere;
    }
    .status {
        margin: 0.3em 0 0;
        font-size: clamp(11px, 4.6cqi, 15px);
    }
    canvas {
        display: block;
        width: 100%;
        aspect-ratio: ${SCOPE_W} / ${SCOPE_H};
        image-rendering: pixelated;
    }
</style>
<div class="lcd" part="lcd">
    <div class="text" aria-live="polite">
        <p class="title"></p>
        <p class="title2"></p>
        <p class="status"></p>
    </div>
    <canvas width="${SCOPE_W}" height="${SCOPE_H}" aria-hidden="true"></canvas>
</div>
`;

export class PmdLcd extends HTMLElement {
    #title: HTMLElement;
    #title2: HTMLElement;
    #status: HTMLElement;
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    #raf = 0;
    #wave = new Float32Array(2048);
    #active = false;
    #colors = { ink: '#1f2a24', mid: '#4f6559' };
    #fps = { frames: 0, updates: 0, last: 0, prev: NaN, text: '' };

    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = template;
        this.#title = root.querySelector('.title')!;
        this.#title2 = root.querySelector('.title2')!;
        this.#status = root.querySelector('.status')!;
        this.#canvas = root.querySelector('canvas')!;
        this.#ctx = this.#canvas.getContext('2d')!;
    }

    connectedCallback() {
        this.#updateColors();
        this.#drawFlat();
    }

    disconnectedCallback() {
        cancelAnimationFrame(this.#raf);
    }

    /**
     * 表示を更新する。active は「この表示が演奏中の曲を指しているか」で、
     * true のときだけ波形を動かす。
     */
    show(text: { title: string; title2?: string; status?: string }, state: PlayerState, active: boolean) {
        this.#title.textContent = text.title;
        this.#title2.textContent = text.title2 ?? '';
        this.#status.textContent = text.status ?? '';
        this.#status.hidden = !text.status;
        // getComputedStyle は重いので、毎フレームではなく表示を更新するときだけ色を取り直す
        this.#updateColors();

        const run = active && state === 'playing';
        if (run && !this.#active) this.#raf = requestAnimationFrame(() => this.#frame());
        if (!run) {
            cancelAnimationFrame(this.#raf);
            // 一時停止中は最後の波形を残す
            if (!(active && state === 'paused')) this.#drawFlat();
        }
        this.#active = run;
    }

    #updateColors() {
        const cs = getComputedStyle(this);
        this.#colors = {
            ink: cs.getPropertyValue('--pce-ink').trim() || '#1f2a24',
            mid: cs.getPropertyValue('--pce-lcd-mid').trim() || '#4f6559',
        };
    }

    #drawFlat() {
        const c = this.#ctx;
        c.clearRect(0, 0, SCOPE_W, SCOPE_H);
        c.fillStyle = this.#colors.mid;
        for (let x = 0; x < SCOPE_W; x += 2) c.fillRect(x, SCOPE_H >> 1, 1, 1);
    }

    #frame() {
        if (reducedMotion.matches) {
            this.#drawFlat();
            return;
        }
        this.#raf = requestAnimationFrame(() => this.#frame());
        if (!PmdPlayer.shared.waveform(this.#wave)) {
            this.#drawFlat();     // 再生直後でまだ波形が届いていない
            return;
        }
        if (SHOW_FPS) this.#countFps();

        // 2048 サンプルを 128 列に縮め、1 ドットの線でつなぐ
        const c = this.#ctx;
        c.clearRect(0, 0, SCOPE_W, SCOPE_H);
        c.fillStyle = this.#colors.ink;
        const step = this.#wave.length / SCOPE_W;
        const mid = (SCOPE_H - 1) / 2;
        let prev = -1;
        for (let x = 0; x < SCOPE_W; x++) {
            const v = this.#wave[Math.floor(x * step)];
            const y = Math.max(0, Math.min(SCOPE_H - 1, Math.round(mid - v * mid * 1.6)));
            const top = prev < 0 ? y : Math.min(y, prev);
            const bottom = prev < 0 ? y : Math.max(y, prev);
            c.fillRect(x, top, 1, bottom - top + 1);
            prev = y;
        }
    }

    #countFps() {
        const f = this.#fps;
        const now = performance.now();
        f.frames++;
        // 表示する波形が前のフレームから変わったか
        const sig = this.#wave[0] + this.#wave[777] * 3 + this.#wave[1500] * 7;
        if (sig !== f.prev) f.updates++;
        f.prev = sig;
        if (!f.last) f.last = now;
        if (now - f.last >= 1000) {
            const sec = (now - f.last) / 1000;
            const { base, output } = PmdPlayer.shared.latency;
            f.text = `描画 ${Math.round(f.frames / sec)}fps / 波形 ${Math.round(f.updates / sec)}回/秒 / ` +
                `base ${Math.round(base * 1000)}ms out ${Math.round(output * 1000)}ms` +
                (lastMediaAction ? ` / OS: ${lastMediaAction}` : '');
            this.#status.textContent = f.text;
            this.#status.hidden = false;
            f.frames = f.updates = 0;
            f.last = now;
        }
    }
}

customElements.get('pmd-lcd') ?? customElements.define('pmd-lcd', PmdLcd);
