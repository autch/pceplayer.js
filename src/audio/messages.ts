// SPDX-License-Identifier: MIT
//
// メインスレッドと AudioWorklet の間でやりとりするメッセージ

export const PROCESSOR_NAME = 'pmd-processor';

export interface ProcessorOptions {
    module: WebAssembly.Module;
}

export type ToProcessor =
    | { type: 'play'; id: number; pmd: Uint8Array }
    | { type: 'stop' };

export type FromProcessor =
    | { type: 'started'; id: number }
    | { type: 'ended'; id: number }
    | { type: 'error'; id: number; message: string }
    // 合成した波形 (表示用)。frame は samples[0] のフレーム番号 (AudioWorkletGlobalScope の currentFrame 基準)
    | { type: 'wave'; id: number; frame: number; samples: Float32Array };
