#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// 開発用の曲データを dev-data/ に用意する。libmuslib の test/fixtures (piece-pmds) を使う。
//   node scripts/dev-data.mjs [--from ../libmuslib/test/fixtures]

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: { from: { type: 'string', default: path.join(root, '..', 'libmuslib', 'test', 'fixtures') } } });
const out = path.join(root, 'dev-data');
mkdirSync(path.join(out, 'pmd'), { recursive: true });
for (const f of readdirSync(values.from).filter((f) => f.endsWith('.pmd'))) {
    cpSync(path.join(values.from, f), path.join(out, 'pmd', f));
}
execFileSync(process.execPath, [path.join(root, 'tools', 'gen-list.ts'), path.join(out, 'pmd'), '-o', path.join(out, 'list.json')], { stdio: 'inherit' });
