pceplayer.js
============

[P/ECE](http://aquaplus.jp/piece/) の標準音楽ドライバーファイル (*.pmd) ファイルを Web ブラウザだけで再生します。

Chrome (Win/Mac/Linux/Android), Safari (Mac/iOS), Firefox (Mac), Edge で動作確認しています。

UI としてはページ全体を使う[フル版](http://pceplayer.tnok.jp/)と、Web ページに埋め込んで使う[ウィジェット版](http://pceplayer.tnok.jp/pko.html)があります。

使い方
-----

Git と Node をインストールしておきます。

1. `git clone https://github.com/autch/pceplayer.js.git`
2. `cd pceplayer`
3. `./pmd/` ディレクトリに pmd ファイルを置く
4. `node ./gen_list.js pmd/`
5. `list.out.json` ファイルに pmd ファイルから抽出したタイトル情報が入っているので、必要に応じて修正して `list.json` として保存する。
6. `pceplayer/`  ディレクトリの中身全部を Web サーバから見えるようにし、`index.html` を開けばフル版で再生可能

埋め込み方
--------

1. 上記手順を済ませる。
2. `test.html` の内容に倣って、ウィジェットを貼りたいページに以下のタグを配置する。`<script src="./embed.js" data-width="400" data-height="300" data-url="./list.json"></script>`
3. `data-width`, `data-height`, `data-url` 属性を必要に応じて修正する。
4. `pceplayer/` ディレクトリの中身全部を Web サーバから見えるようにする。
