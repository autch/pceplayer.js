(function () {
    'use strict';

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    let probeDefaultBufferSize = () => {
        const ua = navigator.userAgent;

        if (/Linux/.test(ua)) {
            return 8192;
        }
        if (/Chrome/.test(ua)) {
            return 0; // use system default
        }
        if (/iPhone|iPod|iPad/.test(ua)) {
            return 2048;
        }
        if (/Safari/.test(ua)) {
            return 2048;
        }
        return 4096;
    };

    function MuslibBrowserInterface() {
        this.muslibSize = 128;
        this.context = new AudioContext();
        this.tmpbuf = new Int16Array(this.muslibSize);

        this.instances = {};
    }

    MuslibBrowserInterface.prototype.stopMusic = function () {
        if ('scrNode' in this.instances) {
            const scrNode = this.instances.scrNode;
            if (scrNode) {
                scrNode.disconnect(0);
                scrNode.onaudioprocess = null;
            }
            this.instances = {};
        }
    };

    const muslibMod = require('./muslib.js');

    MuslibBrowserInterface.prototype.createAudioProcess = function() {
        return (ev) => {
            const muslib = this.instances.muslib;
            const outbuf = ev.outputBuffer.getChannelData(0);

            if (muslib.IsFinished()) {
                this.scrNode.disconnect(0);
                this.scrNode.onaudioprocess = null;
                return;
            }

            for (let op = 0; op < outbuf.length;) {
                muslib.Render(this.tmpbuf);
                for (let i = 0; i < this.tmpbuf.length; i++) {
                    outbuf[op++] = this.tmpbuf[i] / 32767.0;
                    this.tmpbuf[i] = 0;
                }
            }
        }
    };

    MuslibBrowserInterface.prototype.doPlayMusic = function(promise) {
        const unlockBuffer = this.context.createBuffer(1, 1, 22050);
        const unlockSrc = this.context.createBufferSource();
        unlockSrc.buffer = unlockBuffer;
        unlockSrc.connect(this.context.destination);
        unlockSrc.start(0);

        const scrNode = this.context.createScriptProcessor(probeDefaultBufferSize(), 1, 1);
        const srcNode = this.context.createOscillator(); //context.createBufferSource();
        srcNode.connect(scrNode);
        scrNode.onaudioprocess = this.createAudioProcess();
        scrNode.connect(this.context.destination);

        const muslib = new muslibMod.Muslib(this.context.sampleRate);

        this.instances = {
            muslib: muslib,
            srcNode: srcNode,
            scrNode: scrNode
        };

        promise.then(value => {
            muslib.PlayMusic(value);
            srcNode.start(0);
        }).catch(error => {
        });
    };

    MuslibBrowserInterface.prototype.playMusicFromData = function(data) {
        this.doPlayMusic(new Promise((resolve, reject) => {
            resolve(data);
        }));
    };

    MuslibBrowserInterface.prototype.playMusicFromURL = function (href) {
        this.doPlayMusic(new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', href, true);
            request.responseType = 'arraybuffer';
            request.addEventListener('load', (pe) => {
                resolve(new Uint8Array(request.response));
            });
            request.addEventListener('error', (pe) => {
                reject(pe);
            });
            request.send();
        }));
    };

    window.MuslibBrowserInterface = MuslibBrowserInterface;
})();
