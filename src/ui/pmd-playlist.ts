// SPDX-License-Identifier: MIT
//
// <pmd-playlist src="list.json" layout="full|compact" selected="xxx.pmd">
//
// 曲の一覧から選んで鳴らすプレイヤー。list.json は tools/gen-list.ts で作る
// (旧 pceplayer.js と同じ形式: [{ href, filename, name, title, title2 }])。
// href は list.json の場所からの相対で解決する。
//
//   layout="full"     本体のスキャン画像に液晶表示を重ねた、ページ全体向けの表示
//   layout="compact"  液晶の帯と一覧だけの、他のページに埋め込む向けの表示 (既定)

import { PmdPlayer } from '../audio/player.ts';
import faceUrl from '../assets/pme001.png';
import { ensureFonts, tokens } from './style.ts';
import { Controls, controlsHtml, controlsStyle } from './controls.ts';
import './pmd-lcd.ts';
import type { PmdLcd } from './pmd-lcd.ts';

export interface ListItem {
    href: string;
    filename: string;
    name?: string;
    title: string;
    title2: string;
}

interface Track extends ListItem {
    url: string;
}

const template = /* html */ `
<style>
    ${tokens}
    ${controlsStyle}
    :host {
        display: block;
        height: 100%;
    }
    .wrap {
        display: grid;
        height: 100%;
        min-height: 0;
    }

    /* ---- 本体 (full) ---- */
    .device { display: none; }
    :host([layout="full"]) .wrap {
        grid-template-columns: minmax(260px, 420px) minmax(0, 1fr);
        gap: clamp(1.5rem, 4vw, 3.5rem);
        align-items: start;
    }
    :host([layout="full"]) .device {
        display: block;
        position: sticky;
        top: 1.5rem;
    }
    .face {
        position: relative;
        aspect-ratio: 655 / 668;
        background: var(--pce-body) center / 100% 100% no-repeat;
        border-radius: 3% / 3%;
        box-shadow: 0 1px 0 rgb(255 255 255 / 0.4) inset, 0 18px 40px -20px rgb(0 0 0 / 0.6);
    }
    /* スキャン画像の液晶部分 (655x668 中の 58,235 - 603,632) に重ねる */
    .face pmd-lcd {
        position: absolute;
        left: 8.85%;
        top: 35.2%;
        width: 83.2%;
        height: 59.4%;
    }
    .device .controls { margin-top: 1.25rem; }
    :host([layout="full"]) .strip { display: none; }

    /* ---- 液晶の帯 (compact) ---- */
    .strip {
        display: grid;
        gap: 0.6rem;
        padding: 0.6rem;
        background: var(--pce-body);
        --pce-controls-text: var(--pce-silver);
    }
    .strip .controls { justify-content: flex-end; }
    :host(:not([layout="full"])) .wrap { grid-template-rows: auto minmax(0, 1fr); }
    .strip pmd-lcd { min-height: 6.5em; }

    /* ---- 一覧 ---- */
    .list {
        margin: 0;
        padding: 0;
        list-style: none;
        overflow-y: auto;
        min-height: 0;
    }
    :host([layout="full"]) .list { overflow: visible; }
    .row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        column-gap: 1rem;
        width: 100%;
        padding: 0.55rem 0.75rem;
        border: 0;
        border-bottom: 1px solid var(--pce-rule);
        background: none;
        text-align: left;
        cursor: pointer;
    }
    .row:hover { background: rgb(127 127 127 / 0.12); }
    .row[aria-current="true"] {
        background: var(--pce-lcd);
        color: var(--pce-ink);
    }
    .t { font-weight: 700; overflow-wrap: anywhere; }
    .t2 {
        grid-column: 1;
        font-size: 0.85em;
        color: var(--pce-muted);
        overflow-wrap: anywhere;
    }
    .f {
        grid-row: 1 / span 2;
        grid-column: 2;
        align-self: center;
        font-family: var(--pce-font-lcd);
        font-size: 0.85em;
        color: var(--pce-muted);
    }
    .row[aria-current="true"] .t2,
    .row[aria-current="true"] .f { color: var(--pce-ink); }
    .row[data-playing] .t::before {
        content: "♪ ";
    }
    .empty {
        padding: 1rem 0.75rem;
        color: var(--pce-muted);
    }

    @media (max-width: 720px) {
        :host([layout="full"]) .wrap {
            grid-template-columns: 1fr;
        }
        :host([layout="full"]) .device {
            position: static;
            max-width: 360px;
            width: 100%;
            margin: 0 auto;
        }
    }
</style>
<div class="wrap">
    <div class="device">
        <div class="face"><pmd-lcd transparent></pmd-lcd></div>
        ${controlsHtml}
    </div>
    <div class="strip">
        <pmd-lcd></pmd-lcd>
        ${controlsHtml}
    </div>
    <ul class="list" aria-label="曲の一覧"></ul>
</div>
`;

export class PmdPlaylistElement extends HTMLElement {
    static observedAttributes = ['src', 'selected'];

    #player = PmdPlayer.shared;
    #tracks: Track[] = [];
    #selected: Track | null = null;
    #message = '一覧を読み込み中…';
    #error = '';
    #requested = false;
    #lcds: PmdLcd[];
    #controls: Controls;
    #navRegistered = false;
    #nav = { previous: () => this.#step(-1), next: () => this.#step(1) };
    #list: HTMLUListElement;
    #rows = new Map<string, HTMLButtonElement>();

    #onChange = () => {
        const now = this.#player.nowPlaying;
        if (now && !this.#tracks.some((t) => t.url === now.url)) this.#requested = false;
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
        root.querySelector<HTMLElement>('.face')!.style.backgroundImage = `url("${faceUrl}")`;
        this.#lcds = [...root.querySelectorAll<PmdLcd>('pmd-lcd')];
        this.#controls = new Controls(root, { play: () => this.#playSelected() });
        this.#list = root.querySelector('.list')!;
        this.#list.addEventListener('click', (e) => {
            const row = (e.target as Element).closest<HTMLButtonElement>('.row');
            const track = row && this.#tracks.find((t) => t.url === row.dataset.url);
            if (track) this.#play(track);
        });
    }

    connectedCallback() {
        ensureFonts();
        this.#player.addEventListener('change', this.#onChange);
        this.#player.addEventListener('error', this.#onError);
        this.#controls.connect();
        this.#render();
    }

    disconnectedCallback() {
        this.#controls.disconnect();
        this.#player.setTrackNavigation(this, null);
        this.#navRegistered = false;
        this.#player.removeEventListener('change', this.#onChange);
        this.#player.removeEventListener('error', this.#onError);
    }

    attributeChangedCallback(name: string) {
        if (name === 'src') void this.#load();
        else this.#select(this.getAttribute('selected'), true);
    }

    async #load() {
        const src = this.getAttribute('src');
        if (!src) return;
        const listUrl = new URL(src, document.baseURI);
        this.#tracks = [];
        this.#message = '一覧を読み込み中…';
        this.#build();
        try {
            const res = await fetch(listUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const items = (await res.json()) as ListItem[];
            this.#tracks = items.map((item) => ({ ...item, url: new URL(item.href, listUrl).href }));
            this.#message = this.#tracks.length ? '' : '一覧に曲がありません';
        } catch (e) {
            this.#message = `一覧を読み込めません (${e instanceof Error ? e.message : e})`;
        }
        this.#build();
        this.#select(this.getAttribute('selected'), true);
    }

    /** ファイル名 (または名前) で曲を選ぶ。再生はしない */
    #select(key: string | null, scroll: boolean) {
        const track = key ? this.#tracks.find((t) => t.filename === key || t.name === key) : undefined;
        if (!track) return;
        this.#selected = track;
        this.#render();
        if (scroll) this.#rows.get(track.url)?.scrollIntoView({ block: 'nearest' });
    }

    #play(track: Track) {
        this.#selected = track;
        this.#error = '';
        this.#requested = true;
        void this.#player.play(track.url);
        this.dispatchEvent(new CustomEvent('select', { detail: { filename: track.filename } }));
    }

    #playSelected() {
        const track = this.#selected ?? this.#tracks[0];
        if (track) this.#play(track);
    }

    /** 演奏中 (なければ選択中) の曲から delta だけ前後の曲を鳴らす。端では反対側に回る */
    #step(delta: number) {
        if (!this.#tracks.length) return;
        const url = this.#player.nowPlaying?.url ?? this.#selected?.url;
        const i = this.#tracks.findIndex((t) => t.url === url);
        const n = this.#tracks.length;
        const track = this.#tracks[((i < 0 ? 0 : i + delta) % n + n) % n];
        this.#play(track);
        this.#rows.get(track.url)?.scrollIntoView({ block: 'nearest' });
    }

    #build() {
        this.#rows.clear();
        const items = this.#tracks.map((t) => {
            const li = document.createElement('li');
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'row';
            row.dataset.url = t.url;
            const title = document.createElement('span');
            title.className = 't';
            title.textContent = (t.title || `[${t.filename}]`).replaceAll('\n', ' ');
            const title2 = document.createElement('span');
            title2.className = 't2';
            title2.textContent = t.title2.replaceAll('\n', ' ');
            const file = document.createElement('span');
            file.className = 'f';
            file.textContent = t.name ?? t.filename;
            row.append(title, title2, file);
            li.append(row);
            this.#rows.set(t.url, row);
            return li;
        });
        if (this.#message) {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = this.#message;
            items.push(li);
        }
        this.#list.replaceChildren(...items);
        this.#render();
    }

    #render() {
        const now = this.#player.nowPlaying;
        const mine = !!now && this.#tracks.some((t) => t.url === now.url);
        const state = mine ? this.#player.state : 'stopped';
        const current = mine ? this.#tracks.find((t) => t.url === now!.url)! : this.#selected;

        for (const [url, row] of this.#rows) {
            row.setAttribute('aria-current', String(url === current?.url));
            row.toggleAttribute('data-playing', mine && url === now!.url);
        }

        const title = (mine && now!.title) || current?.title || (current ? `[${current.filename}]` : '曲を選んでください');
        const title2 = (mine && now!.title2) || current?.title2 || '';
        const status = this.#error || (state === 'loading' ? '読み込み中…' : state === 'paused' ? '一時停止中' : '');
        for (const lcd of this.#lcds) lcd.show({ title, title2, status }, state, mine);
        this.#controls.update(state, mine, this.#tracks.length > 0);

        // OS の「前の曲」「次の曲」は、この一覧の曲を演奏しているあいだだけ受け持つ
        const nav = mine && this.#tracks.length > 1;
        if (nav !== this.#navRegistered) {
            this.#player.setTrackNavigation(this, nav ? this.#nav : null);
            this.#navRegistered = nav;
        }
    }
}

customElements.get('pmd-playlist') ?? customElements.define('pmd-playlist', PmdPlaylistElement);
