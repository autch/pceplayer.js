// SPDX-License-Identifier: MIT
//
// 再生 / 一時停止ボタン、停止ボタン、音量スライダー。<pmd-player> と <pmd-playlist> で共有する。
// 音量はページ内のすべての部品で共通 (PmdPlayer.shared.volume)。

import { PmdPlayer, type PlayerState } from '../audio/player.ts';

const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3" width="3" height="10"/><rect x="9.5" y="3" width="3" height="10"/></svg>';
const ICON_STOP = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9"/></svg>';
const ICON_VOLUME = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3.5v11L5 10H2z"/><path d="M11 5.2a4 4 0 0 1 0 5.6M12.8 3.4a6.5 6.5 0 0 1 0 9.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

export const controlsStyle = /* css */ `
    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem 0.75rem;
    }
    .controls button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        border: 1px solid #000;
        border-radius: 999px;
        background: var(--pce-body);
        color: var(--pce-silver);
        font-weight: 700;
        cursor: pointer;
    }
    .controls button:hover:not(:disabled) { background: #26282b; }
    .controls button:active:not(:disabled) { transform: translateY(1px); }
    .controls button:disabled { opacity: 0.45; cursor: default; }
    .controls svg { width: 1em; height: 1em; fill: currentColor; flex: none; }
    .controls .main {
        min-width: 7.5em;
        padding: 0.45em 1.1em 0.45em 0.9em;
    }
    .controls .stop {
        width: 2.3em;
        height: 2.3em;
        padding: 0;
    }
    .controls .volume {
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
        color: var(--pce-controls-text, inherit);
    }
    .controls .volume svg { width: 1.15em; height: 1.15em; }
    .controls input[type="range"] {
        width: 7.5em;
        margin: 0;
        accent-color: var(--pce-lcd);
    }
`;

export const controlsHtml = /* html */ `
    <div class="controls">
        <button class="main" type="button"></button>
        <button class="stop" type="button" title="停止" aria-label="停止">${ICON_STOP}</button>
        <label class="volume" title="音量">${ICON_VOLUME}<input type="range" min="0" max="100" step="1" aria-label="音量"></label>
    </div>
`;

export interface ControlHandlers {
    /** 再生ボタン (停止中、または自分の曲でないとき) */
    play(): void;
}

/** root の中の .controls (複数でもよい) をプレイヤーにつなぐ */
export class Controls {
    #player = PmdPlayer.shared;
    #mains: HTMLButtonElement[];
    #stops: HTMLButtonElement[];
    #volumes: HTMLInputElement[];
    #mine = false;
    #onVolume = () => this.#syncVolume();

    constructor(root: ParentNode, handlers: ControlHandlers) {
        this.#mains = [...root.querySelectorAll<HTMLButtonElement>('.controls .main')];
        this.#stops = [...root.querySelectorAll<HTMLButtonElement>('.controls .stop')];
        this.#volumes = [...root.querySelectorAll<HTMLInputElement>('.controls input[type="range"]')];

        for (const b of this.#mains) {
            b.addEventListener('click', () => {
                const state = this.#mine ? this.#player.state : 'stopped';
                if (state === 'playing') this.#player.pause();
                else if (state === 'paused') this.#player.resume();
                else handlers.play();
            });
        }
        for (const b of this.#stops) b.addEventListener('click', () => this.#player.stop());
        for (const v of this.#volumes) {
            v.addEventListener('input', () => {
                this.#player.volume = Number(v.value) / 100;
            });
        }
        this.#syncVolume();
    }

    connect() {
        this.#player.addEventListener('volumechange', this.#onVolume);
        this.#syncVolume();
    }

    disconnect() {
        this.#player.removeEventListener('volumechange', this.#onVolume);
    }

    #syncVolume() {
        const value = String(Math.round(this.#player.volume * 100));
        for (const v of this.#volumes) if (v.value !== value) v.value = value;
    }

    /** mine は「プレイヤーが演奏しているのがこの部品の曲か」、enabled は再生できる曲があるか */
    update(state: PlayerState, mine: boolean, enabled: boolean) {
        this.#mine = mine;
        if (!mine) state = 'stopped';
        const [icon, label] = {
            stopped: [ICON_PLAY, '再生'],
            loading: [ICON_PAUSE, '読み込み中'],
            playing: [ICON_PAUSE, '一時停止'],
            paused: [ICON_PLAY, '再開'],
        }[state];
        for (const b of this.#mains) {
            b.innerHTML = `${icon}<span>${label}</span>`;
            b.disabled = !enabled || state === 'loading';
        }
        for (const b of this.#stops) b.disabled = state === 'stopped';
    }
}
