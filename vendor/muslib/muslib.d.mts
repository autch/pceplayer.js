// SPDX-License-Identifier: MIT

export declare class Muslib {
    static readonly BLOCK_SAMPLES: 128;

    /** コンパイル済みの module から同期で作る (AudioWorklet 内ではこちらを使う) */
    static fromModule(module: WebAssembly.Module): Muslib;
    /** wasm のバイト列か WebAssembly.Module から非同期で作る */
    static load(source: BufferSource | WebAssembly.Module): Promise<Muslib>;

    constructor(instance: WebAssembly.Instance);

    /** 出力サンプリング周波数を設定する。実際に使うレート (上限 96000) を返す */
    init(rate: number): number;
    /** pmd データで演奏を始める。データが不正なら false */
    play(pmd: Uint8Array): boolean;
    stop(): void;
    /** 1 ブロック (128 サンプル) を out に書く。演奏が終わっていれば false */
    render(out: Int16Array): boolean;
    readonly finished: boolean;
    /** タイトルの生バイト列 (文字コードは通常 Shift_JIS) */
    readonly title: Uint8Array;
    readonly title2: Uint8Array;
    /** ヘッダに書かれたパート数 (play() の後で有効) */
    readonly numParts: number;
    /** 確保したメモリを返す。以降このオブジェクトは使えない */
    dispose(): void;
}
