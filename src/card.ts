// SPDX-License-Identifier: MIT
//
// X (Twitter) Player Card 用のページ (card/player.html)。
//   player.html?m=<pmd の URL>&enc=<タイトルの文字コード>
// muslib-card.tnok.jp (Lambda) が返すカードの twitter:player がこの URL を指す。

import './ui/pmd-player.ts';

const params = new URLSearchParams(location.search);
const player = document.querySelector('pmd-player')!;
const m = params.get('m');
if (m) player.setAttribute('src', m);
const enc = params.get('enc');
if (enc) player.setAttribute('encoding', enc);
