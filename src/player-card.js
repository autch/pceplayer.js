'use strict';

import MuslibBrowserInterface from './muslib/browser';

const getParams = query => {
    if (!query) {
        return { };
    }
    
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [ key, value ] = param.split('=');
            params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
        }, { });
};

const params = getParams(window.location.search);
let f = params.m, enc = params.enc || 'Shift_JIS';

const browserIF = new MuslibBrowserInterface();
window.muslibBrowserIF = browserIF;

document.addEventListener('DOMContentLoaded', function() {
    const muslib = browserIF.loadMusicFromURL(f, muslib => {
            const SJisDecoder = v => {
                const t = new TextDecoder(enc);
                return t.decode(v);
            };
            
            const t = muslib.seq.GetTitle(SJisDecoder);
            const t2 = muslib.seq.GetTitle2(SJisDecoder);
            console.log(t, t2);
            
            document.getElementById('title').innerText = t;
            document.getElementById('title2').innerText = t2;
    });
        
    const playButton = document.getElementById('btnPlay');

    function setAsPlay() {
        playButton.innerText = 'PLAY';
        playButton.onclick = function(ev) {
            if(!f) return true;
            
            browserIF.playMusicFromURL(f, () => {
                setAsPlay();
            });
            setAsStop();
            return false;
        };
    }    
    function setAsStop() {
        playButton.innerText = 'STOP';
        playButton.onclick = function(ev) {
            if(!f) return true;
            
            browserIF.stopMusic();
            setAsPlay();
            return false;
        };
    }

    setAsPlay();
});

