// SPDX-License-Identifier: MIT
//
// muslib.wasm の薄いラッパ。Node / ブラウザ / AudioWorklet のどこでも動くよう、
// 環境依存の API (fetch, fs など) は使わない。wasm のバイト列や
// WebAssembly.Module は呼び出し側で用意して渡す。
//
//   const module = await WebAssembly.compile(bytes);   // メインスレッドで
//   const m = Muslib.fromModule(module);               // AudioWorklet 内でも同期で作れる
//   m.init(48000);
//   m.play(pmdBytes);
//   const buf = new Int16Array(Muslib.BLOCK_SAMPLES);
//   while (m.render(buf)) { ... }
//
// 1 つの Muslib が 1 つの wasm インスタンスと 1 曲分の状態を持つ。

const BLOCK_SAMPLES = 128;

export class Muslib {
    static BLOCK_SAMPLES = BLOCK_SAMPLES;

    #ex;
    #ctx;
    #out;
    #u8;
    #i16;

    /** コンパイル済みの module から同期で作る (AudioWorklet 内ではこちらを使う) */
    static fromModule(module) {
        return new Muslib(new WebAssembly.Instance(module, Muslib.#imports()));
    }

    /** wasm のバイト列か WebAssembly.Module から非同期で作る */
    static async load(source) {
        const module = source instanceof WebAssembly.Module ? source : await WebAssembly.compile(source);
        return new Muslib(await WebAssembly.instantiate(module, Muslib.#imports()));
    }

    static #imports() {
        // メモリが伸びたことの通知。ビューは使うたびに作り直すので何もしない
        return { env: { emscripten_notify_memory_growth() {} } };
    }

    constructor(instance) {
        this.#ex = instance.exports;
        this.#ex._initialize?.();
        if (this.#ex.muslib_block_samples() !== BLOCK_SAMPLES) {
            throw new Error('muslib.wasm と muslib.mjs のブロック長が違う');
        }
        this.#ctx = this.#ex.malloc(this.#ex.muslib_size());
        this.#out = this.#ex.malloc(BLOCK_SAMPLES * 2);
        if (!this.#ctx || !this.#out) throw new Error('muslib: メモリを確保できない');
        // malloc したメモリには前に使った値が残っていることがあるので、
        // init() が呼ばれるまで play() が失敗する状態にしておく
        this.#ex.muslib_init(this.#ctx, 0);
    }

    // memory.buffer はメモリが伸びると差し替わるので、そのたびにビューを作り直す
    #heapU8() {
        const buf = this.#ex.memory.buffer;
        if (this.#u8?.buffer !== buf) this.#u8 = new Uint8Array(buf);
        return this.#u8;
    }

    #heap16() {
        const buf = this.#ex.memory.buffer;
        if (this.#i16?.buffer !== buf) this.#i16 = new Int16Array(buf);
        return this.#i16;
    }

    /** 出力サンプリング周波数を設定する。実際に使うレート (上限 96000) を返す */
    init(rate) {
        return this.#ex.muslib_init(this.#ctx, rate);
    }

    /** pmd データ (Uint8Array) で演奏を始める。データが不正なら false */
    play(pmd) {
        const p = this.#ex.malloc(pmd.length || 1);
        if (!p) return false;
        try {
            this.#heapU8().set(pmd, p);
            return this.#ex.muslib_play(this.#ctx, p, pmd.length) === 0;
        } finally {
            this.#ex.free(p);
        }
    }

    stop() {
        this.#ex.muslib_stop(this.#ctx);
    }

    /** 1 ブロック (128 サンプル) を out (Int16Array) に書く。演奏が終わっていれば false */
    render(out) {
        if (!this.#ex.muslib_render(this.#ctx, this.#out)) return false;
        const i = this.#out >> 1;
        out.set(this.#heap16().subarray(i, i + BLOCK_SAMPLES));
        return true;
    }

    get finished() {
        return this.#ex.muslib_finished(this.#ctx) !== 0;
    }

    /** タイトル (NUL 終端前までの生バイト列。文字コードは通常 Shift_JIS) */
    get title() {
        return this.#cstr(this.#ex.muslib_title(this.#ctx));
    }

    get title2() {
        return this.#cstr(this.#ex.muslib_title2(this.#ctx));
    }

    /** ヘッダに書かれたパート数 (play() の後で有効) */
    get numParts() {
        return this.#ex.muslib_num_parts(this.#ctx);
    }

    #cstr(p) {
        const u8 = this.#heapU8();
        const end = u8.indexOf(0, p);
        return u8.slice(p, end < 0 ? p : end);
    }

    /** 確保したメモリを返す。以降このオブジェクトは使えない */
    dispose() {
        this.#ex.free(this.#out);
        this.#ex.free(this.#ctx);
        this.#ctx = this.#out = 0;
    }
}
