# pceplayer

P/ECE の標準音楽ドライバ用の曲データ (pmd) を Web ブラウザで再生する。
音源ドライバは [libmuslib](../libmuslib) (P/ECE muslib を整理したもの) の WebAssembly ビルドで、
AudioWorklet の中で 48kHz で合成する。

## 成果物

| ビルド | 置き場所 | 中身 |
|---|---|---|
| `dist/` (`vite build`) | `pceplayer.tnok.jp` | フル版 (`index.html`)、埋め込み用の `widget.js`、旧形式の埋め込み互換 `embed.js` |
| `dist-card/` (`vite build --mode card`) | `pceplayer-card.tnok.jp` | X (Twitter) Player Card の中で動くプレイヤー (`player.html`) とサムネイル (`pme001.png`) |

`npm run build` で両方を作る。どちらも相対パスで参照し合うので、置くディレクトリは問わない。

### フル版

`index.html` と同じ場所に `list.json` と、そこから参照する pmd を置く。
`?m=<ファイル名>` で、その曲を選んだ状態で開く (曲を選ぶと URL も変わるので、そのまま共有できる)。

### カード

`muslib-card.tnok.jp` (Lambda、この repo の外) が返すカードの `twitter:player` は
`https://pceplayer-card.tnok.jp/player.html?m=<pmd の URL>` を指している。
`dist-card/` の中身で `pceplayer-card.tnok.jp` を置き換えればよい。URL の形式 (`?m=`、`&enc=`) は旧版と同じ。
`pme001.png` は Lambda がカードのサムネイルとして固定の URL で参照しているので、名前を変えないこと。

X の Player Card はドメインの承認制なので、ホスト名は変えないこと。

### ウィジェット (他のページへの埋め込み)

```html
<script type="module" src="https://pceplayer.tnok.jp/widget.js"></script>
<pmd-playlist src="./list.json" style="display:block; height:320px"></pmd-playlist>

<!-- 1 曲だけなら -->
<pmd-player src="./pmd/xxx.pmd" style="display:block; width:320px; height:340px"></pmd-player>
```

旧形式の `<script src=".../embed.js" data-url="./list.json" data-width="400" data-height="300"></script>` も動く。

別のオリジンのページに埋め込む場合は、次の CORS 設定が必要になる。

- `pceplayer.tnok.jp` の `widget.js` と `assets/` (モジュールスクリプト、AudioWorklet、wasm を読み込むため)
- `list.json` と pmd の置き場所 (埋め込み先のページから fetch するため)

### 配信の注意

- `.js` は `text/javascript` で配信すること (モジュールスクリプトは MIME タイプを検査される)。`aws s3 sync` なら拡張子から自動で付く
- `.wasm` は `ArrayBuffer` で読み込んでからコンパイルしているので、`application/wasm` でなくても動く

## 開発

```sh
npm install
npm run dev-data      # 開発用の曲データ (libmuslib の test/fixtures) を dev-data/ に用意する
npm run dev           # http://localhost:5173/
npm test              # Vitest (pmd のヘッダ解析、取り込んだ wasm、gen-list)
npm run typecheck
npm run build         # dist/ と dist-card/
npm run preview       # dist/ を http://localhost:4173/ で確認
```

`dev-data/` は dev / preview サーバでだけ `/list.json` と `/pmd/` として配信され、ビルド結果には入らない。

### list.json を作る

```sh
node tools/gen-list.ts <pmd のディレクトリ> [--href pmd/] [-o list.json]
```

形式は旧 pceplayer.js と同じ (`[{ href, filename, name, title, title2 }]`)。
タイトルは pmd から読み出す (Shift_JIS、`;` は改行)。必要なら出力を手で直してから置く。

### 音源ドライバの更新

`vendor/muslib/` は libmuslib でビルドした `muslib.wasm` と JS ラッパのコピー。
どのコミットから取ったかは `vendor/muslib/VERSION.json` にある。

```sh
# libmuslib 側で
emcmake cmake -S . -B build-wasm -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build-wasm
# こちらで
npm run update-muslib
```

## 構成

- `src/audio/player.ts` — 再生の管理。ページ内で 1 つを共有し、同時に鳴らすのは 1 曲だけ
- `src/audio/processor.ts` — AudioWorkletProcessor。wasm はメインスレッドでコンパイルして渡す
- `src/ui/` — Custom Elements (`<pmd-playlist>`, `<pmd-player>`, `<pmd-lcd>`)
- `src/pmd.ts` — pmd のヘッダ解析とタイトルの文字コード変換 (AudioWorklet では TextDecoder が使えないためメインスレッドで行う)
- `tools/gen-list.ts` — list.json の生成

## ライセンス

このプロジェクトで書いたファイルは MIT License (`LICENSE`)。
`vendor/muslib/muslib.wasm` は P/ECE muslib に由来するので、アクアプラスの再配布条件に従う (`LICENSE-PIECE.md`)。
`src/assets/` と `card/public/pme001.png` は P/ECE 実機のスキャン画像。
