#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// ビルド結果を AWS に上げる。aws CLI を使う (認証は aws CLI の設定に従う)。
//
//   node scripts/deploy.mjs <target> [--prefix next/] [--dry-run] [--no-build] [--no-invalidate] [--allow-dirty]
//   node scripts/deploy.mjs lambda [--function 名前] [--dry-run] [--no-build] [--test]
//
// target:
//   pceplayer     dist/      -> s3://pceplayer.tnok.jp/        (フル版、widget.js、embed.js)
//   tnok-pmuslib  dist/      -> s3://tnok-jp/pmuslib/          (tnok.jp/pmuslib/ のフル版)
//   card          dist-card/ -> s3://pceplayer-card.tnok.jp/   (X Player Card のプレイヤー)
//   lambda        dist-lambda/lambda.zip -> Lambda muslib_twitter_card
//
// S3 への上げ方 (入れ替え中も壊れないように):
//   1. ファイル名にハッシュが入ったもの (assets/) を先に上げる。1 年キャッシュ (immutable)
//   2. それ以外 (widget.js, embed.js, 画像など) を上げる
//   3. HTML を最後に上げる (no-cache)
//   4. 名前が変わらないファイルだけ CloudFront のキャッシュを無効化する
// 古いファイルは消さない (キャッシュに残った古い HTML がまだ参照しているかもしれないため)。
// 曲データ (list.json, pmd/) はここでは扱わない。各サイトの upload.sh で上げる。
//
// --prefix next/ を付けると、そのプレフィックスの下に置く (本番の前の試験配置)。

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = {
    pceplayer: {
        build: 'build', dir: 'dist', bucket: 'pceplayer.tnok.jp', prefix: '',
        distribution: 'E3S37E0LZO2MEJ', exclude: ['widget-demo.html'],
    },
    'tnok-pmuslib': {
        build: 'build', dir: 'dist', bucket: 'tnok-jp', prefix: 'pmuslib/',
        distribution: 'E1PZS04KLXJ2C8', exclude: ['widget-demo.html'],
    },
    card: {
        build: 'build', dir: 'dist-card', bucket: 'pceplayer-card.tnok.jp', prefix: '',
        distribution: 'E11ACXLZ2P113A', exclude: [],
    },
    lambda: {
        build: 'build:lambda', zip: 'dist-lambda/lambda.zip', function: 'muslib_twitter_card',
        runtime: 'nodejs26.x', timeout: 5,
    },
};

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.map': 'application/json',
};

const IMMUTABLE = 'public, max-age=31536000, immutable';
const NO_CACHE = 'no-cache';
const SHORT = 'public, max-age=86400';

const { positionals, values: opt } = parseArgs({
    allowPositionals: true,
    options: {
        prefix: { type: 'string', default: '' },
        'dry-run': { type: 'boolean', default: false },
        'no-build': { type: 'boolean', default: false },
        'no-invalidate': { type: 'boolean', default: false },
        'allow-dirty': { type: 'boolean', default: false },
        function: { type: 'string' },
        test: { type: 'boolean', default: false },
    },
});

const name = positionals[0];
const target = TARGETS[name];
if (!target || positionals.length !== 1) {
    console.error(`usage: node scripts/deploy.mjs <${Object.keys(TARGETS).join('|')}> [options]`);
    process.exit(2);
}
if (opt.prefix && !/^[a-z0-9][a-z0-9_-]*\/$/.test(opt.prefix)) {
    console.error('--prefix は "next/" のように英小文字・数字で始まり "/" で終わる形にする');
    process.exit(2);
}

const dry = opt['dry-run'];
const quote = (a) => (/^[\w./:=@,+-]+$/.test(a) ? a : `'${a.replaceAll("'", "'\\''")}'`);

/** コマンドを実行する (--dry-run なら表示するだけ)。出力を返す */
function run(cmd, args, { capture = false } = {}) {
    console.log(`${dry ? '[dry-run] ' : '$ '}${[cmd, ...args].map(quote).join(' ')}`);
    if (dry) return '';
    return execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' }) ?? '';
}

function git(...args) {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

// 何から作ったか分からないものを本番に出さない
const dirty = git('status', '--porcelain');
if (dirty && !opt['allow-dirty']) {
    console.error('未コミットの変更がある。コミットしてから実行するか、--allow-dirty を付ける:\n' + dirty);
    process.exit(1);
}
console.log(`pceplayer @ ${git('rev-parse', '--short', 'HEAD')}${dirty ? ' (未コミットの変更あり)' : ''} -> ${name}${opt.prefix ? ` (prefix ${opt.prefix})` : ''}`);

if (!opt['no-build']) {
    // ビルドはローカルで完結するので --dry-run でも行う
    execFileSync('npm', ['run', target.build], { cwd: root, stdio: 'inherit' });
}

if (name === 'lambda') {
    deployLambda();
} else {
    deployS3();
}

function deployS3() {
    const dir = path.join(root, target.dir);
    const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : [path.relative(dir, p).split(path.sep).join('/')];
    });
    const files = walk(dir).filter((f) => !target.exclude.includes(f) && !f.endsWith('.map'));
    if (!files.includes('index.html') && !files.includes('player.html')) {
        throw new Error(`${dir} に HTML がない。ビルドを確かめること`);
    }

    const hashed = files.filter((f) => f.startsWith('assets/'));
    const html = files.filter((f) => f.endsWith('.html'));
    const other = files.filter((f) => !hashed.includes(f) && !html.includes(f));
    const prefix = target.prefix + opt.prefix;

    const put = (f, cacheControl) => {
        const type = CONTENT_TYPES[path.extname(f)];
        if (!type) throw new Error(`Content-Type が決められない: ${f}`);
        run('aws', ['s3', 'cp', path.join(target.dir, f), `s3://${target.bucket}/${prefix}${f}`,
            '--acl', 'public-read', '--content-type', type, '--cache-control', cacheControl, '--only-show-errors']);
    };

    console.log(`\n# 1. ハッシュ付きのファイル (${hashed.length})`);
    for (const f of hashed) put(f, IMMUTABLE);
    console.log(`\n# 2. その他 (${other.length})`);
    for (const f of other) put(f, /\.(js|mjs|json)$/.test(f) ? NO_CACHE : SHORT);
    console.log(`\n# 3. HTML (${html.length})`);
    for (const f of html) put(f, NO_CACHE);

    if (opt['no-invalidate']) return;
    const paths = [...other, ...html].map((f) => `/${prefix}${f}`);
    if (html.includes('index.html')) paths.push(`/${prefix}`);
    console.log(`\n# 4. CloudFront のキャッシュを無効化 (${paths.length})`);
    const out = run('aws', ['cloudfront', 'create-invalidation', '--distribution-id', target.distribution,
        '--paths', ...paths, '--query', 'Invalidation.Id', '--output', 'text'], { capture: true });
    if (out) console.log(`invalidation ${out.trim()} (完了まで数分かかることがある)`);

    const host = { 'pceplayer.tnok.jp': 'pceplayer.tnok.jp', 'tnok-jp': 'tnok.jp', 'pceplayer-card.tnok.jp': 'pceplayer-card.tnok.jp' }[target.bucket];
    console.log(`\n-> https://${host}/${prefix}${html.includes('index.html') ? '' : html[0]}`);
}

function deployLambda() {
    const fn = opt.function ?? target.function;
    const zip = path.join(root, target.zip);
    statSync(zip);
    run('aws', ['lambda', 'update-function-code', '--function-name', fn, '--zip-file', `fileb://${target.zip}`,
        '--query', 'LastUpdateStatus', '--output', 'text']);
    run('aws', ['lambda', 'wait', 'function-updated-v2', '--function-name', fn]);
    run('aws', ['lambda', 'update-function-configuration', '--function-name', fn,
        '--runtime', target.runtime, '--timeout', String(target.timeout),
        '--query', '{runtime:Runtime,timeout:Timeout,status:LastUpdateStatus}', '--output', 'json']);
    run('aws', ['lambda', 'wait', 'function-updated-v2', '--function-name', fn]);
    if (opt.test) testLambda(fn);
}

function testLambda(fn) {
    // 実際の pmd でカードを作らせて、タイトルが出るか (= Shift_JIS が読める環境か) を確かめる
    const event = { queryStringParameters: { m: 'https://tnok.jp/pmuslib/pmd/yzs010_opna.pmd' } };
    const out = path.join(root, 'dist-lambda', 'test-response.json');
    run('aws', ['lambda', 'invoke', '--function-name', fn, '--cli-binary-format', 'raw-in-base64-out',
        '--payload', JSON.stringify(event), out, '--query', 'StatusCode', '--output', 'text']);
    if (dry) return;
    const res = JSON.parse(readFileSync(out, 'utf8'));
    const title = /name="twitter:title" content="([^"]*)"/.exec(res.body ?? '')?.[1];
    console.log(`statusCode=${res.statusCode} twitter:title=${title}`);
    if (res.statusCode !== 200 || !title || title === 'P/ECE pmd Twitter Card') {
        console.error('カードにタイトルが出ていない。ランタイムを確かめること');
        process.exitCode = 1;
    }
}
