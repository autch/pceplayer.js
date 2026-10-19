// SPDX-License-Identifier: MIT
//
// フル版 (index.html)。?m=<ファイル名> でその曲を選んだ状態で開く。
// 曲を選ぶと URL の ?m= も更新するので、そのまま共有できる。

import './ui/pmd-playlist.ts';

const list = document.querySelector('pmd-playlist')!;
const m = new URLSearchParams(location.search).get('m');
if (m) list.setAttribute('selected', m);

list.addEventListener('select', (e) => {
    const url = new URL(location.href);
    url.searchParams.set('m', (e as CustomEvent<{ filename: string }>).detail.filename);
    history.replaceState(null, '', url);
});
