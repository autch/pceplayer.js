// SPDX-License-Identifier: MIT
//
// 他のページに埋め込むためのエントリ (widget.js)。読み込むと <pmd-playlist> と
// <pmd-player> が使えるようになる。
//
//   <script type="module" src="https://pceplayer.tnok.jp/widget.js"></script>
//   <pmd-playlist src="./list.json" style="height: 320px"></pmd-playlist>
//
// 別オリジンから読み込む場合、widget.js と関連ファイルを配信するサーバに CORS の
// 許可 (Access-Control-Allow-Origin) が必要。list.json と pmd は埋め込み先のページから
// 読み込むので、それぞれの置き場所でも同様。

import './ui/pmd-playlist.ts';
import './ui/pmd-player.ts';
