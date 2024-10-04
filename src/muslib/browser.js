import muslibMod from "./muslib.js";

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

export default class MuslibBrowserInterface {
    constructor() {
        this.muslibSize = 128;
        this.context = null; //new AudioContext();
        this.tmpbuf = new Int16Array(this.muslibSize);

        this.instances = {};
    }

    getContext() {
        if (this.context === null) {
            this.context = new AudioContext();
        }
        return this.context;
    }

    defaultDoneCallback(/*next*/) {
        if ('scrNode' in this.instances) {
            const scrNode = this.instances.scrNode;
            if (scrNode) {
                scrNode.disconnect(0);
                scrNode.onaudioprocess = null;
            }
            this.instances = {};
        }
    }

    stopMusic() {
        this.defaultDoneCallback();
    }

    createAudioProcess() {
        return (ev) => {
            const muslib = this.instances.muslib;
            const outbuf = ev.outputBuffer.getChannelData(0);

            if (muslib.IsFinished()) {
                this.instances.doneCallback();
            }

            for (let op = 0; op < outbuf.length;) {
                muslib.Render(this.tmpbuf);
                for (let i = 0; i < this.tmpbuf.length; i++) {
                    outbuf[op++] = this.tmpbuf[i] / 32767.0;
                    this.tmpbuf[i] = 0;
                }
            }
        }
    }

    doLoadMusic(promise) {
        const muslib = new muslibMod(44100);

        this.instances = {
            muslib: muslib,
        };

        promise.then(data => muslib.PlayMusic(data)).catch((/*error*/) => {
        });

        return muslib;
    }

    loadMusicFromData(data) {
        return this.doLoadMusic(new Promise((resolve, /*reject*/) => {
            resolve(data);
        }));
    }

    download(href) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', href, true);
            request.responseType = 'arraybuffer';
            request.addEventListener('load', (/*pe*/) => {
                resolve(new Uint8Array(request.response));
            });
            request.addEventListener('error', (pe) => {
                reject(pe);
            });
            request.send();
        });
    }

    loadMusicFromURL(href) {
        return this.doLoadMusic(this.download(href));
    }

    doPlayMusic(promise, callback) {
        const context = this.getContext();

        const unlockBuffer = context.createBuffer(1, 1, 22050);
        const unlockSrc = context.createBufferSource();
        unlockSrc.buffer = unlockBuffer;
        unlockSrc.connect(context.destination);
        unlockSrc.start(0);

        const scrNode = context.createScriptProcessor(probeDefaultBufferSize(), 1, 1);
        const srcNode = context.createOscillator(); //context.createBufferSource();
        srcNode.connect(scrNode);
        scrNode.connect(context.destination);

        const muslib = new muslibMod(context.sampleRate);

        let cb;
        if (callback) {
            cb = callback;
        } else {
            cb = this.defaultDoneCallback;
        }

        this.instances = {
            muslib: muslib,
            srcNode: srcNode,
            scrNode: scrNode,
            doneCallback: cb
        };

        promise.then(value => {
            muslib.PlayMusic(value);
        }).then(() => {
            scrNode.onaudioprocess = this.createAudioProcess();
            srcNode.start(0)
        }).catch(error => {
            console.error(error)
        });
    }

    playMusicFromData(data, cb) {
        this.doPlayMusic(new Promise((resolve, /*reject*/) => {
            resolve(data);
        }), cb);
    }

    playMusicFromURL(href, cb) {
        this.doPlayMusic(this.download(href), cb);
    }
}
