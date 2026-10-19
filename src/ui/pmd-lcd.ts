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

        const run = active && state === 'playing';
        if (run && !this.#active) this.#raf = requestAnimationFrame(() => this.#frame());
        if (!run) {
            cancelAnimationFrame(this.#raf);
            this.#drawFlat();
        }
        this.#active = run;
    }

    #inkColors() {
        const cs = getComputedStyle(this);
        return {
            ink: cs.getPropertyValue('--pce-ink').trim() || '#1f2a24',
            mid: cs.getPropertyValue('--pce-lcd-mid').trim() || '#4f6559',
        };
    }

    #drawFlat() {
        const c = this.#ctx;
        c.clearRect(0, 0, SCOPE_W, SCOPE_H);
        c.fillStyle = this.#inkColors().mid;
        for (let x = 0; x < SCOPE_W; x += 2) c.fillRect(x, SCOPE_H >> 1, 1, 1);
    }

    #frame() {
        const analyser = PmdPlayer.shared.analyser;
        if (!analyser || matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.#drawFlat();
            return;
        }
        analyser.getFloatTimeDomainData(this.#wave);

        // 2048 サンプルを 128 列に縮め、1 ドットの線でつなぐ
        const c = this.#ctx;
        const { ink } = this.#inkColors();
        c.clearRect(0, 0, SCOPE_W, SCOPE_H);
        c.fillStyle = ink;
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
        this.#raf = requestAnimationFrame(() => this.#frame());
    }
}

customElements.get('pmd-lcd') ?? customElements.define('pmd-lcd', PmdLcd);
