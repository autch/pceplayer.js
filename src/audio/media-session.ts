// SPDX-License-Identifier: MIT
//
// Media Session API で、OS の再生コントロール (iOS のコントロールセンターやロック画面、
// Android の通知など) とプレイヤーをつなぐ。
//   - 曲のタイトル、サブタイトル、画像を表示する
//   - 再生 / 一時停止 / 停止 / 前の曲 / 次の曲 をプレイヤーの操作として受ける
// Media Session に対応していないブラウザでは何もしない。
//
// OS から操作が届くと、プレイヤーに 'mediaaction' (detail は操作の名前) を出す (調べるため)。

import artworkUrl from '../assets/pme001.png';
import type { PmdPlayer } from './player.ts';

export function bindMediaSession(player: PmdPlayer): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;

    const handle = (action: MediaSessionAction, handler: (() => void) | null) => {
        try {
            session.setActionHandler(action, handler && (() => {
                player.dispatchEvent(new CustomEvent('mediaaction', { detail: action }));
                handler();
            }));
        } catch {
            // そのブラウザが対応していない操作
        }
    };

    handle('play', () => player.resume());
    handle('pause', () => player.pause());
    handle('stop', () => player.stop());

    let key = '';

    // iOS は曲の情報 (metadata) が変わったときに使える操作を読み取るようなので、
    // 先に操作を登録してから曲の情報を設定し、操作が変わったときも設定し直す
    const refresh = () => {
        const now = player.nowPlaying;
        const nav = now ? player.trackNavigation : null;
        handle('previoustrack', nav ? () => nav.previous() : null);
        handle('nexttrack', nav ? () => nav.next() : null);

        if (!now) {
            session.metadata = null;
            key = '';
        } else {
            // 読み込み中はタイトルがまだ空なので、届いたら作り直す
            const k = `${now.url}\n${now.title}\n${nav ? 1 : 0}`;
            if (k !== key) {
                key = k;
                session.metadata = new MediaMetadata({
                    title: (now.title || decodeURIComponent(now.url.split('/').pop() ?? '')).replaceAll('\n', ' '),
                    artist: now.title2.replaceAll('\n', ' '),
                    album: 'P/ECE',
                    artwork: [{ src: new URL(artworkUrl, location.href).href, sizes: '655x668', type: 'image/png' }],
                });
            }
        }
        session.playbackState = player.state === 'playing' ? 'playing' : player.state === 'paused' ? 'paused' : 'none';
    };

    player.addEventListener('change', refresh);
    player.addEventListener('navigationchange', refresh);
}
