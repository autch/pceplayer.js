// SPDX-License-Identifier: MIT
//
// X (Twitter) Player Card 用のページ (card/player.html)。
//   player.html?m=<pmd の URL>
// muslib-card.tnok.jp (Lambda) が返すカードの twitter:player がこの URL を指す。
// 旧版の &enc= (タイトルの文字コード) は、付いていても無視する (タイトルは Shift_JIS に固定)。

import './ui/pmd-player.ts';

const params = new URLSearchParams(location.search);
const player = document.querySelector('pmd-player')!;
const m = params.get('m');
if (m) player.setAttribute('src', m);
