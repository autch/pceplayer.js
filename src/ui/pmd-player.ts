// SPDX-License-Identifier: MIT
//
// <pmd-player src="...">: 1 曲だけを鳴らすプレイヤー。
// X (Twitter) の Player Card の iframe (320x340) に収まるように作ってある。

import { PmdPlayer } from '../audio/player.ts';
import { decodeTitle, parsePmd } from '../pmd.ts';
import logoUrl from '../assets/pme-logo.png';
import { ensureFonts, ICON_PLAY, ICON_STOP, playButton, tokens } from './style.ts';
import './pmd-lcd.ts';
import type { PmdLcd } from './pmd-lcd.ts';

const template = /* html */ `
<style>
    ${tokens}
    ${playButton}
    :host {
        display: block;
        height: 100%;
    }
    .body {
        display: grid;
        grid-template-rows: auto 1fr auto;
        height: 100%;
        background: #000;   /* ロゴ画像 (スキャン) の地に合わせる */
        color: var(--pce-silver);
    }
    .logo {
        display: block;
        width: min(40%, 160px);
        height: auto;
        margin: 1.2em auto 1em;
    }
    pmd-lcd {
        margin: 0 6%;
        min-height: 0;
    }
    .controls {
        display: flex;
        justify-content: center;
        padding: 1em;
    }
    .play {
        background: #2c2e32;
        border-color: #3a3d42;
    }
</style>
<div class="body">
    <img class="logo" alt="P/ECE" width="222" height="125">
    <pmd-lcd></pmd-lcd>
    <div class="controls">
        <button class="play" type="button"></button>
    </div>
</div>
`;

export class PmdPlayerElement extends HTMLElement {
    static observedAttributes = ['src'];

    #player = PmdPlayer.shared;
    #lcd: PmdLcd;
    #button: HTMLButtonElement;
    #title = '';
    #title2 = '';
    #error = '';
    #requested = false;    // この部品から再生を要求した (エラーを自分のものとして表示する)
    #onChange = () => {
        const now = this.#player.nowPlaying;
        if (now && now.url !== this.src) this.#requested = false;
        this.#render();
    };
    #onError = (e: Event) => {
        if (!this.#requested) return;
        this.#requested = false;
        this.#error = (e as CustomEvent<string>).detail;
        this.#render();
    };

    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = template;
        root.querySelector<HTMLImageElement>('.logo')!.src = logoUrl;
        this.#lcd = root.querySelector('pmd-lcd')!;
        this.#button = root.querySelector('.play')!;
        this.#button.addEventListener('click', () => this.#toggle());
    }

    get src(): string {
        const src = this.getAttribute('src');
        return src ? new URL(src, document.baseURI).href : '';
    }

    connectedCallback() {
        ensureFonts();
        this.#player.addEventListener('change', this.#onChange);
        this.#player.addEventListener('error', this.#onError);
        this.#render();
    }

    disconnectedCallback() {
        this.#player.removeEventListener('change', this.#onChange);
        this.#player.removeEventListener('error', this.#onError);
    }

    attributeChangedCallback() {
        this.#title = this.#title2 = this.#error = '';
        if (this.isConnected) void this.#preview();
        this.#render();
    }

    #isMine(): boolean {
        return this.#player.nowPlaying?.url === this.src;
    }

    // 再生前にタイトルだけ表示しておく
    async #preview() {
        const src = this.src;
        if (!src) return;
        try {
            const res = await fetch(src);
            if (!res.ok || src !== this.src) return;
            const header = parsePmd(new Uint8Array(await res.arrayBuffer()));
            if (!header) return;
            this.#title = decodeTitle(header.title);
            this.#title2 = decodeTitle(header.title2);
            this.#render();
        } catch {
            // 再生ボタンを押したときに改めてエラーを出す
        }
    }

    #toggle() {
        if (this.#isMine()) {
            this.#player.stop();
        } else if (this.src) {
            this.#error = '';
            this.#requested = true;
            void this.#player.play(this.src);
        }
    }

    #render() {
        const mine = this.#isMine();
        const state = mine ? this.#player.state : 'stopped';
        const now = mine ? this.#player.nowPlaying : null;
        const title = now?.title || this.#title || (this.src ? this.src.split('/').pop()! : '曲が指定されていません');
        const title2 = now?.title2 || this.#title2;
        const status = this.#error || (state === 'loading' ? '読み込み中…' : '');
        this.#lcd.show({ title, title2, status }, state, mine);

        this.#button.disabled = !this.src;
        this.#button.innerHTML = mine ? `${ICON_STOP}<span>停止</span>` : `${ICON_PLAY}<span>再生</span>`;
    }
}

customElements.get('pmd-player') ?? customElements.define('pmd-player', PmdPlayerElement);
