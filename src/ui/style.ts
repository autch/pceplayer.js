// SPDX-License-Identifier: MIT
//
// UI 部品で共有するスタイル。色は P/ECE 実機のスキャン画像から取っている。
// カスタムプロパティは Shadow DOM の中にも継承されるので、ページ側で上書きできる。

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+1p:wght@400;700&display=swap';

/** Web フォントの <link> を (まだなければ) document に追加する。Shadow DOM 内でも効く */
export function ensureFonts(): void {
    if (document.querySelector(`link[href="${FONTS_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_URL;
    document.head.append(link);
}

export const tokens = /* css */ `
    :host {
        --pce-lcd: #6f8a7c;          /* 液晶の地 */
        --pce-lcd-mid: #4f6559;      /* 液晶の中間調 */
        --pce-ink: #1f2a24;          /* 液晶の濃い表示 */
        --pce-body: #17181a;         /* 本体 */
        --pce-silver: #c9ccd6;       /* ロゴの銀 */
        --pce-page: #d6d8dc;
        --pce-text: #22252a;
        --pce-muted: #5e636b;
        --pce-rule: #b9bcc3;
        --pce-focus: #2b6cb0;

        --pce-font-lcd: 'DotGothic16', 'MS Gothic', monospace;
        --pce-font-ui: 'M PLUS 1p', system-ui, sans-serif;

        font-family: var(--pce-font-ui);
        color: var(--pce-text);
    }
    @media (prefers-color-scheme: dark) {
        :host {
            --pce-page: #2a2c30;
            --pce-text: #e4e5e8;
            --pce-muted: #a3a7ae;
            --pce-rule: #44474d;
            --pce-focus: #7fb0ea;
        }
    }
    *, *::before, *::after { box-sizing: border-box; }
    button { font: inherit; color: inherit; }
    :focus-visible { outline: 2px solid var(--pce-focus); outline-offset: 2px; }
`;
