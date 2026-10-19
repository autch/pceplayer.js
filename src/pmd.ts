// SPDX-License-Identifier: MIT
//
// pmd ファイルのヘッダ解析。ブラウザと Node (tools/gen-list.ts) の両方で使う。
//
// ヘッダの構造 (オフセットはファイル先頭から、16bit リトルエンディアン):
//   [0x00]?            先頭が 0 なら 1 バイト読み飛ばす
//   parts.b            パート数
//   part_ofs.h[parts]  各パートのシーケンス
//   drums_ofs.h        ドラムパターン表
//   title_ofs.h        タイトル (NUL 終端)。0 ならなし
//   title2_ofs.h       サブタイトル (NUL 終端)。0 ならなし

export interface PmdHeader {
    parts: number;
    title: Uint8Array;
    title2: Uint8Array;
}

/** ヘッダを読む。pmd として読めないときは null */
export function parsePmd(data: Uint8Array): PmdHeader | null {
    if (data.length < 2) return null;
    const base = data[0] === 0 ? 1 : 0;
    const parts = data[base];
    const table = base + 1 + parts * 2;
    if (parts === 0 || table + 6 > data.length) return null;

    const u16 = (off: number) => data[off] | (data[off + 1] << 8);
    const cstr = (off: number) => {
        if (off === 0 || off >= data.length) return new Uint8Array(0);
        const end = data.indexOf(0, off);
        return data.subarray(off, end < 0 ? data.length : end);
    };
    return {
        parts,
        title: cstr(u16(table + 2)),
        title2: cstr(u16(table + 4)),
    };
}

/** タイトルのバイト列を文字列にする。pmd の文字コードは通常 Shift_JIS */
export function decodeTitle(bytes: Uint8Array, encoding = 'shift_jis'): string {
    let decoder: TextDecoder;
    try {
        decoder = new TextDecoder(encoding);
    } catch {
        decoder = new TextDecoder('shift_jis');
    }
    // mucc は MML の ";" を改行の意味で使う
    return decoder.decode(bytes).replaceAll(';', '\n');
}
