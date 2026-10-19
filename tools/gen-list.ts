#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// pmd ファイルのディレクトリから list.json を作る。
//
//   node tools/gen-list.ts <pmd のディレクトリ> [--href <list.json から見た pmd の場所>] [-o list.json]
//
// --href の既定は "pmd/"。出力は旧 pceplayer.js と同じ形式:
//   [{ "href": "pmd/xxx.pmd", "filename": "xxx.pmd", "name": "xxx", "title": "...", "title2": "..." }]
// タイトルは手で直したいことがあるので、必要なら出力を編集してから使う。

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { decodeTitle, parsePmd } from '../src/pmd.ts';

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        href: { type: 'string', default: 'pmd/' },
        o: { type: 'string', default: 'list.json' },
        encoding: { type: 'string', default: 'shift_jis' },
    },
});
if (positionals.length !== 1) {
    console.error('usage: node tools/gen-list.ts <pmd dir> [--href pmd/] [-o list.json]');
    process.exit(2);
}

const dir = positionals[0];
const names = (await readdir(dir))
    .filter((f) => /\.pmd$/i.test(f))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const list = [];
for (const filename of names) {
    const header = parsePmd(new Uint8Array(await readFile(path.join(dir, filename))));
    if (!header) {
        console.warn(`skip: ${filename} (pmd として読めない)`);
        continue;
    }
    list.push({
        href: values.href + filename,
        filename,
        name: filename.replace(/\.pmd$/i, ''),
        title: decodeTitle(header.title, values.encoding),
        title2: decodeTitle(header.title2, values.encoding),
    });
}

await writeFile(values.o, JSON.stringify(list, null, 2) + '\n');
console.log(`${list.length} 曲 -> ${values.o}`);
