// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handler, validatePmdUrl } from '../lambda/handler.ts';
import { makePmd } from './helpers.ts';

const PLAYER = 'https://pceplayer-card.tnok.jp/player.html';
const PMD = 'https://tnok.jp/pmuslib/pmd/test.pmd';

const meta = (html: string, name: string) =>
    new RegExp(`<meta name="${name}" content="([^"]*)">`).exec(html)?.[1];
const unescape = (s: string | undefined) =>
    s?.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

function stubFetch(impl: (url: URL, init?: RequestInit) => Promise<Response>) {
    const fn = vi.fn(impl);
    vi.stubGlobal('fetch', fn);
    return fn;
}

beforeEach(() => {
    vi.stubEnv('PLAYER_URL', PLAYER);
});
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('validatePmdUrl', () => {
    test.each([
        'https://tnok.jp/pmuslib/pmd/a.pmd',
        'https://www.tnok.jp/a.pmd',
        'https://a.b.tnok.jp/a.pmd',
        'https://TNOK.JP/a.pmd',
        'https://tnok.jp:443/a.pmd',
    ])('受け付ける: %s', (m) => expect(validatePmdUrl(m)).not.toBeNull());

    test.each([
        undefined,
        '',
        'not a url',
        'http://tnok.jp/a.pmd',
        'https://example.com/a.pmd',
        'https://eviltnok.jp/a.pmd',
        'https://tnok.jp.example.com/a.pmd',
        'https://tnok.jp:8443/a.pmd',
        'https://user:pass@tnok.jp/a.pmd',
        'ftp://tnok.jp/a.pmd',
        'javascript:alert(1)//tnok.jp',
    ])('受け付けない: %s', (m) => expect(validatePmdUrl(m)).toBeNull());
});

describe('handler', () => {
    test('pmd のタイトルでカードを作る', async () => {
        const fetch = stubFetch(async () => new Response(makePmd({ title: 'テスト', title2: 'sub;line' })));
        const res = await handler({ queryStringParameters: { m: PMD } });
        expect(res.statusCode).toBe(200);
        expect(res.headers['Content-Type']).toMatch(/^text\/html/);
        expect(meta(res.body, 'twitter:card')).toBe('player');
        expect(meta(res.body, 'twitter:title')).toBe('テスト');
        expect(meta(res.body, 'twitter:description')).toBe('sub line');
        expect(unescape(meta(res.body, 'twitter:player'))).toBe(`${PLAYER}?m=${encodeURIComponent(PMD)}`);

        // Lambda からの取得はリダイレクトを追わず、タイムアウトを付ける
        const [url, init] = fetch.mock.calls[0];
        expect(String(url)).toBe(PMD);
        expect(init?.redirect).toBe('error');
        expect(init?.signal).toBeInstanceOf(AbortSignal);
    });

    test.each(['Shift_JIS', 'utf-8', 'nope'])('旧版の enc=%s は無視する (タイトルは Shift_JIS)', async (enc) => {
        stubFetch(async () => new Response(makePmd()));
        const res = await handler({ queryStringParameters: { m: PMD, enc } });
        expect(res.statusCode).toBe(200);
        expect(meta(res.body, 'twitter:title')).toBe('テスト');
        const player = new URL(unescape(meta(res.body, 'twitter:player'))!);
        expect([...player.searchParams.keys()]).toEqual(['m']);
    });

    test('m に & が入っていてもプレイヤーの URL に別のパラメータが紛れ込まない', async () => {
        stubFetch(async () => new Response(makePmd()));
        const m = 'https://tnok.jp/a.pmd?x=1&enc=evil';
        const res = await handler({ queryStringParameters: { m } });
        const player = new URL(unescape(meta(res.body, 'twitter:player'))!);
        expect([...player.searchParams.keys()]).toEqual(['m']);
        expect(player.searchParams.get('m')).toBe(m);
    });

    test('タイトルは HTML エスケープする', async () => {
        stubFetch(async () => new Response(makePmd({ title: '"><script>x</script>', title2: "a'b&c" })));
        const res = await handler({ queryStringParameters: { m: PMD } });
        expect(res.body).not.toContain('<script>');
        expect(unescape(meta(res.body, 'twitter:title'))).toBe('"><script>x</script>');
        expect(unescape(meta(res.body, 'twitter:description'))).toBe("a'b&c");
    });

    test.each([
        ['クエリなし', null],
        ['m なし', {}],
        ['許可していないホスト', { m: 'https://example.com/a.pmd' }],
        ['http', { m: 'http://tnok.jp/a.pmd' }],
    ])('400: %s', async (_, params) => {
        const fetch = stubFetch(async () => new Response(makePmd()));
        const res = await handler({ queryStringParameters: params });
        expect(res.statusCode).toBe(400);
        expect(fetch).not.toHaveBeenCalled();
    });

    const generic = async (impl: () => Promise<Response>) => {
        stubFetch(impl);
        const res = await handler({ queryStringParameters: { m: PMD } });
        expect(res.statusCode).toBe(200);
        expect(meta(res.body, 'twitter:title')).toBe('P/ECE pmd Twitter Card');
        expect(meta(res.body, 'twitter:player')).toBeDefined();
        return res;
    };

    test('pmd が読めなければ汎用のカード: 404', () => generic(async () => new Response('x', { status: 404 })));
    test('pmd が読めなければ汎用のカード: ネットワークエラー', () => generic(async () => { throw new TypeError('fetch failed'); }));
    test('pmd が読めなければ汎用のカード: pmd でない', () => generic(async () => new Response(new Uint8Array([0, 0]))));

    test('TextDecoder が Shift_JIS を扱えない環境でも汎用のカードを返す', async () => {
        vi.stubGlobal('TextDecoder', class {
            constructor() {
                throw new RangeError('The "shift_jis" encoding is not supported');
            }
        });
        await generic(async () => new Response(makePmd()));
    });

    test('64KB を超える pmd は読まない (Content-Length)', async () => {
        const big = new Uint8Array(0x10001);
        big.set(makePmd());
        await generic(async () => new Response(big, { headers: { 'Content-Length': String(big.length) } }));
    });

    test('64KB を超える pmd は読まない (Content-Length なし)', async () => {
        const chunk = makePmd();
        let sent = 0;
        const body = new ReadableStream<Uint8Array>({
            pull(c) {
                // 64KB を超えるまで送り続ける
                if (sent > 0x10000 + 4096) { c.close(); return; }
                c.enqueue(sent === 0 ? chunk : new Uint8Array(4096));
                sent += sent === 0 ? chunk.length : 4096;
            },
        });
        await generic(async () => new Response(body));
    });

    test('ちょうど 64KB の pmd は読む', async () => {
        const data = new Uint8Array(0x10000);
        data.set(makePmd());
        stubFetch(async () => new Response(data));
        const res = await handler({ queryStringParameters: { m: PMD } });
        expect(meta(res.body, 'twitter:title')).toBe('テスト');
    });

    test('PLAYER_URL がなければ 500', async () => {
        vi.stubEnv('PLAYER_URL', '');
        stubFetch(async () => new Response(makePmd()));
        const res = await handler({ queryStringParameters: { m: PMD } });
        expect(res.statusCode).toBe(500);
    });
});
