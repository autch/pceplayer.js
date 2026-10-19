// SPDX-License-Identifier: MIT
//
// muslib-card.tnok.jp の Lambda (Node.js 22 以降)。X (Twitter) の Player Card 用の HTML を返す。
//
//   GET /card/card?m=<pmd の URL>
//
// twitter:player は環境変数 PLAYER_URL (https://pceplayer-card.tnok.jp/player.html) に
// ?m= を付けたもの。pmd のヘッダからタイトル (Shift_JIS) を読んでカードに出す。
// 旧版の &enc= (タイトルの文字コード) は、すでにポストされたカードを壊さないよう
// 付いていても無視する。
//
// m に指定できるのは https:// の tnok.jp とそのサブドメインだけ (自分のドメインだが、
// 誤って他所の URL でカードを作らないため)。Lambda から pmd を取りに行くので、
// 64KB を超えるもの、リダイレクト、時間のかかる応答は読まない。
// 読めなかったときはタイトルなしの汎用のカードを返す。
//
// API Gateway (REST / HTTP API のどちらでも) の Lambda プロキシ統合を想定。

import { decodeTitle, parsePmd } from '../src/pmd.ts';

const MAX_PMD_SIZE = 0x10000;
const FETCH_TIMEOUT_MS = 2500;
const ALLOWED_DOMAIN = 'tnok.jp';
const SITE = '@autch';
const IMAGE = 'https://pceplayer-card.tnok.jp/pme001.png';
const DEFAULT_TITLE = 'P/ECE pmd Twitter Card';
const DEFAULT_DESCRIPTION = 'Plays P/ECE music sequence';
const PLAYER_WIDTH = 320;
const PLAYER_HEIGHT = 340;

export interface CardEvent {
    queryStringParameters?: Record<string, string | undefined> | null;
}

export interface CardResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}

const escapeHtml = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** カードのメタデータとして出せるように、改行や制御文字を空白にして長さを抑える */
const oneLine = (s: string, max: number) => {
    const t = s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > max ? t.slice(0, max - 1) + '…' : t;
};

/** m として受け付ける URL か。受け付けるなら正規化した URL を返す */
export function validatePmdUrl(m: string | undefined): URL | null {
    if (!m) return null;
    let url: URL;
    try {
        url = new URL(m);
    } catch {
        return null;
    }
    const host = url.hostname;
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password || url.port) return null;
    if (host !== ALLOWED_DOMAIN && !host.endsWith('.' + ALLOWED_DOMAIN)) return null;
    return url;
}

/** pmd を最大 64KB まで読む。読めなければ null */
async function fetchPmd(url: URL): Promise<Uint8Array | null> {
    let res: Response;
    try {
        res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch {
        return null;
    }
    if (!res.ok || !res.body) return null;
    const length = Number(res.headers.get('content-length') ?? 0);
    if (length > MAX_PMD_SIZE) {
        await res.body.cancel();
        return null;
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body.getReader();
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.length;
            if (total > MAX_PMD_SIZE) {
                await reader.cancel();
                return null;
            }
            chunks.push(value);
        }
    } catch {
        return null;
    }
    const data = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
        data.set(c, off);
        off += c.length;
    }
    return data;
}

async function readTitles(url: URL): Promise<{ title: string; title2: string } | null> {
    const pmd = await fetchPmd(url);
    const header = pmd && parsePmd(pmd);
    if (!header) return null;
    try {
        return {
            title: oneLine(decodeTitle(header.title), 70),
            title2: oneLine(decodeTitle(header.title2), 200),
        };
    } catch {
        // ICU を省いたビルドの Node.js では Shift_JIS の TextDecoder が作れない
        return null;
    }
}

function errorResponse(statusCode: number, message: string): CardResponse {
    return {
        statusCode,
        headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' },
        body: `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>${statusCode}</title></head><body><p>${escapeHtml(message)}</p></body></html>\n`,
    };
}

export async function handler(event: CardEvent): Promise<CardResponse> {
    const params = event.queryStringParameters ?? {};
    const pmdUrl = validatePmdUrl(params.m);
    if (!pmdUrl) {
        return errorResponse(400, 'm には https://tnok.jp/ (またはそのサブドメイン) の pmd の URL を指定してください');
    }
    const playerBase = process.env.PLAYER_URL;
    if (!playerBase) return errorResponse(500, 'PLAYER_URL が設定されていません');
    const player = new URL(playerBase);
    player.searchParams.set('m', pmdUrl.href);

    const titles = await readTitles(pmdUrl);
    const title = titles?.title || DEFAULT_TITLE;
    const description = titles ? titles.title2 || DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION;

    const e = escapeHtml;
    const playerUrl = e(player.href);
    const body = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>${e(title)}</title>
    <meta name="twitter:card" content="player">
    <meta name="twitter:site" content="${e(SITE)}">
    <meta name="twitter:title" content="${e(title)}">
    <meta name="twitter:description" content="${e(description)}">
    <meta name="twitter:image" content="${e(IMAGE)}">
    <meta name="twitter:player" content="${playerUrl}">
    <meta name="twitter:player:width" content="${PLAYER_WIDTH}">
    <meta name="twitter:player:height" content="${PLAYER_HEIGHT}">
</head>
<body>
    <iframe src="${playerUrl}" width="${PLAYER_WIDTH}" height="${PLAYER_HEIGHT}" title="${e(title)}"></iframe>
    <p><a href="${playerUrl}">プレイヤーを開く</a></p>
</body>
</html>
`;
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            // pmd のタイトルが変わることはまずないので長めにキャッシュさせる
            'Cache-Control': titles ? 'public, max-age=86400' : 'public, max-age=300',
        },
        body,
    };
}
