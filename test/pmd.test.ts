// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { Muslib } from '../vendor/muslib/muslib.mjs';
import { decodeTitle, parsePmd } from '../src/pmd.ts';
import { makePmd } from './helpers.ts';

describe('parsePmd', () => {
    test('タイトルとパート数を読む', () => {
        const h = parsePmd(makePmd())!;
        expect(h.parts).toBe(1);
        expect(decodeTitle(h.title)).toBe('テスト');
        expect(decodeTitle(h.title2)).toBe('sub\nline');
    });

    test('先頭の 0 を読み飛ばす', () => {
        const h = parsePmd(makePmd({ zeroPrefix: true }))!;
        expect(decodeTitle(h.title)).toBe('テスト');
    });

    test('タイトルのオフセットが 0 なら空', () => {
        const h = parsePmd(makePmd({ title: '' }))!;
        expect(h.title.length).toBe(0);
    });

    test('pmd でないデータ', () => {
        expect(parsePmd(new Uint8Array([]))).toBeNull();
        expect(parsePmd(new Uint8Array([0, 0]))).toBeNull();
        expect(parsePmd(new Uint8Array([5, 1, 2]))).toBeNull();
    });
});

describe('vendor/muslib', () => {
    test('取り込んだ wasm で合成できる', async () => {
        const wasm = readFileSync(new URL('../vendor/muslib/muslib.wasm', import.meta.url));
        const m = await Muslib.load(wasm);
        expect(m.init(48000)).toBe(48000);
        expect(m.play(makePmd())).toBe(true);
        expect(decodeTitle(m.title)).toBe('テスト');

        const buf = new Int16Array(Muslib.BLOCK_SAMPLES);
        let blocks = 0, peak = 0;
        while (m.render(buf) && blocks < 100000) {
            blocks++;
            for (const v of buf) peak = Math.max(peak, Math.abs(v));
        }
        expect(m.finished).toBe(true);
        expect(blocks).toBeGreaterThan(10);
        expect(peak).toBeGreaterThan(1000);
        m.dispose();
    });
});

describe('tools/gen-list.ts', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'pceplayer-'));
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    test('list.json を作る', () => {
        writeFileSync(path.join(dir, 'b.pmd'), makePmd());
        writeFileSync(path.join(dir, 'A.pmd'), makePmd({ title: '' }));
        writeFileSync(path.join(dir, 'broken.pmd'), new Uint8Array([0, 0]));
        writeFileSync(path.join(dir, 'note.txt'), 'x');
        const out = path.join(dir, 'list.json');
        execFileSync(process.execPath, ['tools/gen-list.ts', dir, '--href', 'm/', '-o', out], { stdio: 'pipe' });
        expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual([
            { href: 'm/A.pmd', filename: 'A.pmd', name: 'A', title: '', title2: 'sub\nline' },
            { href: 'm/b.pmd', filename: 'b.pmd', name: 'b', title: 'テスト', title2: 'sub\nline' },
        ]);
    });
});
