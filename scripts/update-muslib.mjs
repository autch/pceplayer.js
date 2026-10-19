#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// libmuslib でビルドした muslib.wasm と JS ラッパを vendor/muslib/ にコピーする。
//
//   node scripts/update-muslib.mjs [--from ../libmuslib]
//
// libmuslib 側で先に `cmake --build build-wasm` しておくこと。
// どのコミットから取ったかを vendor/muslib/VERSION.json に記録する。
// libmuslib の作業ツリーに未コミットの変更があるときはコピーしない
// (どのソースの wasm か分からなくなるため)。

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: { from: { type: 'string', default: path.join(root, '..', 'libmuslib') } } });
const lib = path.resolve(values.from);
const git = (...args) => execFileSync('git', ['-C', lib, ...args], { encoding: 'utf8' }).trim();

if (git('status', '--porcelain')) {
    console.error(`${lib} に未コミットの変更がある。コミットしてからビルドし直すこと`);
    process.exit(1);
}

const files = [
    ['build-wasm/muslib.wasm', 'muslib.wasm'],
    ['wasm/muslib.mjs', 'muslib.mjs'],
    ['wasm/muslib.d.mts', 'muslib.d.mts'],
];
const wasm = path.join(lib, files[0][0]);
const commitTime = Number(git('log', '-1', '--format=%ct')) * 1000;
if ((await stat(wasm)).mtimeMs < commitTime) {
    console.error(`${wasm} が最新のコミットより古い。libmuslib で cmake --build build-wasm すること`);
    process.exit(1);
}

const out = path.join(root, 'vendor', 'muslib');
await mkdir(out, { recursive: true });
for (const [from, to] of files) await copyFile(path.join(lib, from), path.join(out, to));
await writeFile(path.join(out, 'VERSION.json'), JSON.stringify({
    source: 'libmuslib',
    commit: git('rev-parse', 'HEAD'),
    date: git('log', '-1', '--format=%cI'),
}, null, 2) + '\n');
console.log(`vendor/muslib <- ${lib} @ ${git('rev-parse', '--short', 'HEAD')}`);
