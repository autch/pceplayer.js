# P/ECE SDK 由来のソースについて

この repo の `vendor/muslib/muslib.wasm` は libmuslib (`src/`) をビルドしたもので、
P/ECE 標準音楽ライブラリ muslib のソースを元に改変したものです。
このファイルには MIT License (`LICENSE`) は適用されません。

```
Copyright (C)2001 AQUAPLUS Co., Ltd. / OeRSTED, Inc. all rights reserved.
Coded by MIO.H (OeRSTED)
```

## 再配布の条件

アクアプラスによる「付属ソースを元にしたプログラムの再配布の扱いについて」
(<https://aquaplus.jp/piece/intr.html> より引用):

> P/ECEは、カーネル、ライブラリ、アプリケーションのソースファイルを公開しています。
> P/ECE付属のセットアップCD、WEB等による配布での差分等によって得られる、ソースを元に、改造したプログラムを発表・配布・販売する事に関しての扱いをお知らせします。
>
> これらのソースに関しては、アクアプラスが著作権を所有していますが、 P/ECE用のプログラムである限り、このソースを元にプログラムを改良して自由に再配布する事が可能です。
> WEBやCD−ROM等のメディアを使って発表する際に、アクアプラスの許可を得る必要はありません。
>
> 但し、配布する際には、元にしたソースファイル名が明確にドキュメントに記述されている必要があります。
> また、その改変されたプログラムにより、使用したユーザの P/ECE並びにPCに不具合が発生した場合の責任をアクアプラスに求めないように告知されていなければなりません。
>
> また、アクアプラスは、これらの変更を加えたプログラムの内容並び、適用した結果について、一切の責任を負うものではありません。

## 元にしたソースファイル

P/ECE SDK の `sysdev/music/` の `mus.c`、`seq.c`、`musdef.h`、`exp12.c`、`instdef.c`、`wavetable.c`、
`wave/i_*.c` を元にしています。auPiECE.kpi (Yui N. / S. Kino. / Kobarin による改変版) と
libmuslib を経由しています。ファイルごとの対応は libmuslib の `LICENSE-PIECE.md` を参照してください。
