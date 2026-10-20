# pceplayer

P/ECE の標準音楽ドライバ用の曲データ (pmd) を Web ブラウザで再生する。
音源ドライバは [libmuslib](https://github.com/autch/libmuslib) (P/ECE muslib を整理したもの) の WebAssembly ビルドで、
AudioWorklet の中で 48kHz で合成する。

## 成果物

| ビルド | 置き場所 | 中身 |
|---|---|---|
| `dist/` (`vite build`) | `pceplayer.tnok.jp` | フル版 (`index.html`)、埋め込み用の `widget.js`、旧形式の埋め込み互換 `embed.js` |
| `dist-card/` (`vite build --mode card`) | `pceplayer-card.tnok.jp` | X (Twitter) Player Card の中で動くプレイヤー (`player.html`) とサムネイル (`pme001.png`) |
| `dist-lambda/lambda.zip` (`npm run build:lambda`) | `muslib-card.tnok.jp` の Lambda | Player Card 用の HTML を返す関数 (`index.mjs` 1 ファイル、依存なし) |

`npm run build` で `dist/` と `dist-card/` を作る。Lambda は `npm run build:lambda` で別に作る。どちらも相対パスで参照し合うので、置くディレクトリは問わない。

### フル版

`index.html` と同じ場所に `list.json` と、そこから参照する pmd を置く。
`?m=<ファイル名>` で、その曲を選んだ状態で開く (曲を選ぶと URL も変わるので、そのまま共有できる)。
`?fps` を付けると、液晶に描画と波形の更新の頻度、オーディオの遅延 (`baseLatency` / `outputLatency`) を出す (端末ごとの見え方を調べるため)。

### カード

`muslib-card.tnok.jp` (Lambda、この repo の外) が返すカードの `twitter:player` は
`https://pceplayer-card.tnok.jp/player.html?m=<pmd の URL>` を指している。
`dist-card/` の中身で `pceplayer-card.tnok.jp` を置き換えればよい。URL の形式 (`?m=`) は旧版と同じ。
旧版にあった `&enc=` (タイトルの文字コード) は、付いていても無視する。pmd のタイトルは Shift_JIS と決めている。
`pme001.png` は Lambda がカードのサムネイルとして固定の URL で参照しているので、名前を変えないこと。

X の Player Card はドメインの承認制なので、ホスト名は変えないこと。

### カードの Lambda (`lambda/handler.ts`)

`https://muslib-card.tnok.jp/card/card?m=<pmd の URL>` に対して、Player Card 用の HTML を返す (旧版の `&enc=` は無視する)。
API Gateway の Lambda プロキシ統合 (REST / HTTP API のどちらでも) を想定している。

- `twitter:player` は環境変数 `PLAYER_URL` (`https://pceplayer-card.tnok.jp/player.html`) に `?m=` を付けたもの
- pmd のヘッダを読んで、曲のタイトルを `twitter:title` に、サブタイトルを `twitter:description` に出す。
  読めなかったときは汎用の文言にする
- `m` に指定できるのは `https://` の `tnok.jp` とそのサブドメインだけ (誤って他所の URL でカードを作らないため)。
  それ以外や、`m` がないときは 400 を返す
- Lambda から pmd を取りに行くので、64KB を超えるもの、リダイレクト、2.5 秒以上かかる応答は読まない

デプロイ:

- ランタイムは Node.js 22 以降で動く (`nodejs26.x` を推奨。22 は 2027 年 4 月に非推奨、7 月に更新できなくなる)。
  `dist-lambda/lambda.zip` をアップロードする (ハンドラは `index.handler` のままでよい。Node.js のランタイムは `index.mjs` も探す)
- タイトルの読み出しには Shift_JIS の `TextDecoder` (Node.js の完全な ICU) を使う。使えない環境では汎用の文言のカードになるので、
  デプロイ後にテストイベントで `twitter:title` に曲名が出ることを確かめる
- 関数のタイムアウトは 3 秒以上にする (pmd の取得に最大 2.5 秒かける)
- 関数からインターネットに出られること (VPC に入れていなければそのまま出られる)

旧版 (2018 年、Mustache を使っていたもの) からの変更点:

- クエリがないと例外で 502 になっていたのを、400 にした
- `m` を文字列のまま連結していたので、`m` に `&` を含めるとプレイヤーの URL に別のパラメータを足せた。
  `URLSearchParams` で組み立てるようにした (そのため `m` はパーセントエンコードされる。プレイヤー側は新旧どちらもデコードして読む)
- 使っていなかった旧エンジンのバンドル (`browser.dist.js`) と Mustache への依存をなくした
- `Cache-Control` を付けた

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

## デプロイ

`scripts/deploy.mjs` (`npm run deploy -- <target>`) で上げる。aws CLI の認証を使う。

| target | 上げるもの | 置き場所 |
|---|---|---|
| `pceplayer` | `dist/` | `s3://pceplayer.tnok.jp/` |
| `tnok-pmuslib` | `dist/` | `s3://tnok-jp/pmuslib/` |
| `card` | `dist-card/` | `s3://pceplayer-card.tnok.jp/` |
| `lambda` | `dist-lambda/lambda.zip` | Lambda `muslib_twitter_card` (ランタイムを `nodejs26.x`、タイムアウトを 5 秒にする) |

```sh
npm run deploy -- pceplayer --dry-run          # 実行するコマンドを表示するだけ
npm run deploy -- pceplayer --prefix next/     # 試験配置 (https://pceplayer.tnok.jp/next/)
npm run deploy -- pceplayer
npm run deploy -- lambda --test                # 更新後に実際の pmd でカードを作らせて確かめる
```

- 未コミットの変更があると止まる (何から作ったか分からないものを出さないため)。ビルドは毎回やり直す
- ハッシュ付きのファイル (`assets/`) → その他 → HTML の順に上げ、名前が変わらないものだけ CloudFront のキャッシュを無効化する。
  古いファイルは消さないので、入れ替え中にキャッシュに残った古い HTML も動く
- 曲データ (`list*.json`、`pmd*/`) と、埋め込みのあるページ (`pko.html` など) はここでは扱わない。各サイトの `upload.sh` で上げる
  (`~/src/pceplayer.tnok.jp/upload.sh` は `site/` を、`~/src/tnok.jp/upload.sh` は `public/` を上げる。どちらも引数を `aws s3 sync` に渡すので `--dryrun` が使える)

## 開発

`npm run dev-data` と `npm run update-muslib` は、[libmuslib](https://github.com/autch/libmuslib) をこの repo と同じ階層 (`../libmuslib`) に clone してある前提で動く
(別の場所なら `npm run update-muslib -- --from <libmuslib>`、`npm run dev-data -- --from <libmuslib>/test/fixtures`)。

```sh
npm install
npm run dev-data      # 開発用の曲データ (libmuslib の test/fixtures) を dev-data/ に用意する
npm run dev           # http://localhost:5173/
npm test              # Vitest (pmd のヘッダ解析、取り込んだ wasm、gen-list、カードの Lambda)
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

`vendor/muslib/` は [libmuslib](https://github.com/autch/libmuslib) でビルドした `muslib.wasm` と JS ラッパのコピー。
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
- `src/audio/processor.ts` — AudioWorkletProcessor。wasm はメインスレッドでコンパイルして渡す。
  合成した波形はフレーム番号を付けてメインスレッドへ送り、液晶の波形表示は出力のタイムスタンプで
  いま聞こえている位置に合わせる (Android では出力側がまとめて合成させるので、AnalyserNode だと
  カクつき、音より 0.2 秒ほど先を表示してしまう)
- `src/audio/media-session.ts` — Media Session API で OS の再生コントロールとつなぐ (曲名・画像の表示、再生 / 一時停止 / 停止 / 前後の曲)
- `src/ui/` — Custom Elements (`<pmd-playlist>`, `<pmd-player>`, `<pmd-lcd>`) と、共通の操作部 (`controls.ts`: 再生 / 一時停止、停止、音量)

### OS の再生コントロールについて (2026 年 10 月に確かめたこと)

音は Web Audio だけで鳴らしている。

- iOS: Dynamic Island とロック画面に曲名と画像が出る。一時停止 / 再開は OS が AudioContext を止める・動かすのを
  `statechange` で拾ってページの表示を合わせている。前後の曲の操作はページに届かない
- 出力を `<audio>` 要素に通す方式も試した。MediaStream を流す方式は iOS で前後の曲が届くが Dynamic Island に出ず、
  Android ではピッチが狂う。無音の `<audio>` をループさせる方式は iOS で前後の曲が届くが Dynamic Island に出ない。
  どちらも Android (Xperia 5 IV、Redmi Pad) では再生コントロール自体が出なかった。得るものが少ないので採らなかった
- `src/pmd.ts` — pmd のヘッダ解析とタイトルの文字コード変換 (AudioWorklet では TextDecoder が使えないためメインスレッドで行う)
- `tools/gen-list.ts` — list.json の生成
- `lambda/handler.ts` — カードの Lambda

## ライセンス

このプロジェクトで書いたファイルは MIT License (`LICENSE`)。
`vendor/muslib/muslib.wasm` は P/ECE muslib に由来するので、アクアプラスの再配布条件に従う (`LICENSE-PIECE.md`)。
`src/assets/` と `card/public/pme001.png` は P/ECE 実機のスキャン画像。
