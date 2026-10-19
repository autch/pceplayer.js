// SPDX-License-Identifier: MIT
//
// テスト用の小さな pmd を作る

const SJIS: Record<string, number[]> = { 'テ': [0x83, 0x65], 'ス': [0x83, 0x58], 'ト': [0x83, 0x67] };

/** テスト用の最小限の Shift_JIS エンコーダ (ASCII と、ここで使う全角文字だけ) */
export const sjis = (s: string) => s.split('').flatMap((c) => SJIS[c] ?? [c.charCodeAt(0)]);

/**
 * 1 パートだけの小さな pmd を作る。
 * パート: 音量 127、音長 48、o4c を 1 音、終わり
 */
export function makePmd({ zeroPrefix = false, title = 'テスト', title2 = 'sub;line' } = {}): Uint8Array {
    const head = zeroPrefix ? [0] : [];
    const base = head.length;
    const headerLen = 1 + 2 + 2 + 2 + 2;              // parts, part0, drums, title, title2
    const seq = [0xe9, 127, 48, 0x80 + 48, 0];
    const seqOfs = base + headerLen;
    const t = [...sjis(title), 0];
    const t2 = [...sjis(title2), 0];
    const tOfs = seqOfs + seq.length;
    const t2Ofs = tOfs + t.length;
    const le = (n: number) => [n & 0xff, n >> 8];
    return new Uint8Array([...head, 1, ...le(seqOfs), ...le(0), ...le(title ? tOfs : 0), ...le(t2Ofs), ...seq, ...t, ...t2]);
}
