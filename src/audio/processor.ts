// SPDX-License-Identifier: MIT
//
// muslib で pmd を合成する AudioWorkletProcessor。
// wasm はメインスレッドでコンパイルした WebAssembly.Module を processorOptions で受け取る
// (AudioWorkletGlobalScope では fetch が使えない)。

import { Muslib } from '../../vendor/muslib/muslib.mjs';
import { PROCESSOR_NAME, type FromProcessor, type ProcessorOptions, type ToProcessor } from './messages.ts';

const BLOCK: number = Muslib.BLOCK_SAMPLES;

class PmdProcessor extends AudioWorkletProcessor {
    #muslib: Muslib;
    #block = new Int16Array(BLOCK);
    #pos = BLOCK;             // #block の未出力位置。BLOCK なら次を合成する
    #id = 0;                  // 演奏中の曲の番号。0 なら停止中

    constructor(options: { processorOptions?: unknown }) {
        super();
        const { module } = options.processorOptions as ProcessorOptions;
        this.#muslib = Muslib.fromModule(module);
        this.#muslib.init(sampleRate);
        this.port.onmessage = (e: MessageEvent<ToProcessor>) => this.#onMessage(e.data);
    }

    #post(msg: FromProcessor) {
        this.port.postMessage(msg);
    }

    #onMessage(msg: ToProcessor) {
        switch (msg.type) {
            case 'play':
                if (this.#muslib.play(msg.pmd)) {
                    this.#id = msg.id;
                    this.#pos = BLOCK;
                    this.#post({ type: 'started', id: msg.id });
                } else {
                    this.#id = 0;
                    this.#post({ type: 'error', id: msg.id, message: 'pmd として読めないデータ' });
                }
                break;
            case 'stop':
                this.#muslib.stop();
                this.#id = 0;
                break;
        }
    }

    process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
        const out = outputs[0][0];
        if (!this.#id) return true;   // 出力はゼロで初期化されている

        // render quantum は通常 128 だが、ブラウザによっては変わりうるので
        // 128 サンプル単位の合成結果を必要な分だけ切り出す
        for (let i = 0; i < out.length; i++) {
            if (this.#pos === BLOCK) {
                if (!this.#muslib.render(this.#block)) {
                    this.#post({ type: 'ended', id: this.#id });
                    this.#id = 0;
                    return true;
                }
                this.#pos = 0;
            }
            out[i] = this.#block[this.#pos++] / 32768;
        }
        return true;
    }
}

registerProcessor(PROCESSOR_NAME, PmdProcessor);
