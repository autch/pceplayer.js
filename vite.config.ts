// SPDX-License-Identifier: MIT
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Connect, type Plugin } from 'vite';

// 開発用の曲データ (dev-data/list.json, dev-data/pmd/) を dev / preview サーバでだけ配信する。
// public/ に置くとビルド結果にコピーされてしまうので分けている。
function devData(): Plugin {
    const dir = path.resolve(import.meta.dirname, 'dev-data');
    const serve: Connect.NextHandleFunction = (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://x').pathname;
        if (!/^\/(list\.json|pmd\/[^/]+)$/.test(url)) return next();
        const file = path.join(dir, decodeURIComponent(url));
        try {
            if (!statSync(file).isFile()) return next();
        } catch {
            return next();
        }
        res.setHeader('Content-Type', url.endsWith('.json') ? 'application/json' : 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        createReadStream(file).pipe(res);
    };
    return {
        name: 'pceplayer-dev-data',
        configureServer: (server) => void server.middlewares.use(serve),
        configurePreviewServer: (server) => void server.middlewares.use(serve),
    };
}

// `vite build` で pceplayer.tnok.jp 向け (dist/)、
// `vite build --mode card` で pceplayer-card.tnok.jp 向け (dist-card/)、
// `vite build --mode lambda` で muslib-card.tnok.jp の Lambda (dist-lambda/) を作る。
// どちらも base を相対にして、置き場所を問わないようにしている。
export default defineConfig(({ mode }) => {
    const common = {
        base: './',
        plugins: [devData()],
        // 実機 (iPhone など) で試すときの cloudflared のクイックトンネル (https://*.trycloudflare.com) を受け付ける。
        // AudioWorklet はセキュアコンテキストでしか動かないので、LAN の http:// では試せない
        server: { allowedHosts: ['.trycloudflare.com'] },
        preview: { allowedHosts: ['.trycloudflare.com'] },
        worker: { format: 'es' as const },
    };
    if (mode === 'lambda') {
        // muslib-card.tnok.jp の Lambda (Node.js 22 以降で動く)。依存なしの index.mjs 1 ファイルにする
        return {
            publicDir: false as const,
            build: {
                ssr: 'lambda/handler.ts',
                outDir: 'dist-lambda',
                emptyOutDir: true,
                target: 'node22',
                minify: false,
                rollupOptions: { output: { format: 'es' as const, entryFileNames: 'index.mjs' } },
            },
            ssr: { noExternal: true },
        };
    }
    if (mode === 'card') {
        return {
            ...common,
            root: 'card',
            publicDir: 'public',   // card/public/pme001.png はカードのサムネイル (Lambda が固定 URL で参照)
            build: {
                outDir: '../dist-card',
                emptyOutDir: true,
                rollupOptions: { input: 'card/player.html' },
            },
        };
    }
    return {
        ...common,
        build: {
            rollupOptions: {
                input: {
                    index: 'index.html',
                    'widget-demo': 'widget-demo.html',
                    widget: 'src/widget.ts',
                },
                output: {
                    // 埋め込み用の widget.js だけはファイル名を固定する
                    entryFileNames: (chunk: { name: string }) =>
                        chunk.name === 'widget' ? 'widget.js' : 'assets/[name]-[hash].js',
                },
            },
        },
    };
});
