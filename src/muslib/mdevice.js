import gexp from "./gexp.js";
import {inst as instDef} from "./inst.js";

// Sign EXtend
let sex = function (v) {
    return ((v & 0xff) << 24) >> 24;
}, sexS = function (v) {
    return ((v & 0xffff) << 16) >> 16;
};

export default class MDevice {
    constructor(fs, ch) {
        this.FS2 = fs;
        this.FOFS = Math.floor(Math.log2(this.FS2) * 12 * 256 + 0.5);
        this.ch = ch;
        this.vibwk = 0;

        this.VOLS = 1;
        this.ENVSTART = (-4 * 12 * 256) << this.VOLS;
        this.ENVSTOP = (-10 * 12 * 256) << this.VOLS;
        this.ENVRR = 4000 << this.VOLS;
        this.T1CONST = 0x4000;

        this.IT_LOOP = 0x10;
        this.IT_FAST = 0x80;

        this.IBASE0 = 43008 + instDef.PITCH440 - 69 * 256 + 60 * 256;

        this.XSF1 = 10;
        this.XSF2 = 14;
    }

// Tone Generators
    MakeWaveLP(buffer, vv, cnt) {
        const tbl = this.data;
        let cc = this.freqwk;
        let p = 0;
        do {
            const o = (cc >>> 14);
            const x = (cc & 0x3fff);
            let d1 = tbl[o];
            let d2 = tbl[o + 1];
            if ((cc += this.freq) >= this.loop_end) {
                cc -= this.loop_w;
            }
            d2 -= d1;
            d2 *= x;
            d2 >>= 14;
            d1 += d2;
            d1 *= vv;
            buffer[p++] += d1 >> 8;
        } while (--cnt);
        this.freqwk = cc;
    }

    MakeWaveNL(buffer, vv, cnt) {
        const tbl = this.data;
        let cc = this.freqwk;
        let p = 0;
        do {
            const o = (cc >>> 14);
            const x = (cc & 0x3fff);
            let d1 = tbl[o];
            let d2 = tbl[o + 1];
            if ((cc += this.freq) >= this.loop_end) {
                this.freq = 0;
                return;
            }
            d2 -= d1;
            d2 *= x;
            d2 >>= 14;
            d1 += d2;
            d1 *= vv;
            buffer[p++] += d1 >> 8;
        } while (--cnt);
        this.freqwk = cc;
    }

    MakeWaveSQR(buffer, vv, cnt) {
        let cc = this.freqwk;
        let p = 0;
        vv >>= 1;
        do {
            buffer[p++] += sexS((cc & 0x8000) ? vv : -vv);
            cc += this.freq;
        } while (--cnt);
        this.freqwk = cc;
    }

    MakeWaveSAW(buffer, vv, cnt) {
        let cc = this.freqwk;
        let p = 0;
        do {
            const aa = sexS(cc);
            buffer[p++] += sexS((aa * vv) >> 16);
            cc += this.freq;
        } while (--cnt);
        this.freqwk = cc;
    }

    MakeWaveTRI(buffer, vv, cnt) {
        let cc = sexS(this.freqwk);
        let p = 0;
        vv >>= 1;
        do {
            let dd = cc * vv;
            if (cc < 0) dd = -dd;
            dd -= vv << 14;
            buffer[p++] += sexS(dd >> 14);
            cc = sexS(cc + sexS(this.freq));
        } while (--cnt);
        this.freqwk = sexS(cc);
    }

// Envelope Generators
    setEnvSpeed(n) {
        return gexp(n * 192 + 4 * 12 * 256) << this.VOLS;
    }

    setEnvSpeed2(n) {
        return Math.floor(this.setEnvSpeed(n) * 16000.0 / this.FS2);
    }

    genEnvR() {
        if ((this.envwk -= this.ENVRR) < this.ENVSTOP) {
            this.envwk = this.ENVSTOP;
            this.freq = 0;
        }
    }

    genEnvS() {
        if ((this.envwk -= this.envSR) < this.ENVSTOP) {
            this.envwk = this.ENVSTOP;
            this.freq = 0;
        }
    }

    genEnvD() {
        if ((this.envwk -= this.envDR) < this.envSL) {
            this.genenv = this.genEnvS;
        }
    }

    genEnvA() {
        if ((this.envwk += this.envAR) > 0) {
            this.envwk = 0;
            this.genenv = this.genEnvD;
        }
    }

    genEnvInit() {
        this.envwk = this.envAR ? this.ENVSTART : 0;
        this.genenv = this.genEnvA;
    }

    SetEnv(ar, dr, sl, sr) {
        if (sl > 127) sl = 127;
        this.envSL = (sl - 127) * (192 * (1 << this.VOLS));
        this.envAR = this.setEnvSpeed2(ar);
        this.envDR = this.setEnvSpeed2(dr);
        this.envSR = this.setEnvSpeed2(sr);
    }

// Vibrato Generators
    setVibSpeed(n) {
        return gexp(n * 192 + 8 * 12 * 256);
    }

    setVibSpeed2(n) {
        return Math.floor(this.setVibSpeed(n) * 16000.0 / this.FS2);
    }

    genVibS2() {
        let a = sexS(this.vibwk += this.vibvv);
        if (a < 0) a = -a;
        a = 0x4000 - a;
        this.ptwk2 = (a * this.vibdpwk) >> 3;
    }

    genVibS1() {
        if ((this.vibdpwk += this.vibv2) >= this.vibdpe) {
            this.genvib = this.genVibS2;
            this.vibdpwk = this.vibdpe;
        }
        this.genVibS2();
    }

    genVibS0() {
        if ((this.vibdpwk += this.vibv1) >= this.T1CONST) {
            this.genvib = this.genVibS1;
            this.vibwk = 0;
            this.vibdpwk = 0;
        }
    }

    genVibInit() {
        this.genvib = this.genVibS0;
        this.vibdpwk = 0;
    }

    SetVib(depth, spd, t1, t2) {
        this.vibdpe = depth * 12 * 8;
        this.vibvv = this.setVibSpeed2(spd);
        this.vibv1 = this.setVibSpeed2(t1);
        this.vibv2 = this.setVibSpeed2(t2);
    }

// Instruments
    SetInst(inst) {
        this.data = inst.data;
        this.loop_end = inst.loop_end;
        this.loop_w = inst.loop_end - inst.loop_top;
        this.freq = 0;
        this.ipitch = inst.pitch_fs - inst.pitch_org + (this.IBASE0 - this.FOFS);
        this.envAR = 0;

        if (inst.wtype & this.IT_FAST) {
            switch (inst.param) {
                case 0:
                    this.genwave = this.MakeWaveSQR;
                    break;
                case 1:
                    this.genwave = this.MakeWaveSAW;
                    break;
                case 2:
                    this.genwave = this.MakeWaveTRI;
                    break;
            }
        } else if (inst.wtype & this.IT_LOOP) {
            this.genwave = this.MakeWaveLP;
        } else {
            this.genwave = this.MakeWaveNL;
        }
    }

    SetVol(vol) {
        this.pvol = (vol * 192 + 11 * 12 * 256) << this.VOLS;
        this.pexp = 0;
    }

    SetExp(exp) {
        exp -= 127;
        this.pexp = (exp * 192) << this.VOLS;
    }

    SetExpRel(expr) {
        this.pexp += (expr * 192) << this.VOLS;
    }

// Synth
    NoteOn(pitch) {
        this.freqwk = 0;
        this.ptwk1 = 0;
        this.ptwk2 = 0;
        this.cpitch = this.ipitch + pitch;
        this.freq = 1;
        this.genEnvInit();
        this.genVibInit();
    }

    NotePitch(pitch) {
        this.cpitch = this.ipitch + pitch;
    }

    NoteOff() {
        this.genenv = this.genEnvR;
    }

    SetupCh(ch) {
        this.ch = ch;
    }

    Render(buffer) {
        if (this.freq) {
            this.genvib.call(this);
            this.freq = gexp(this.cpitch +
                (this.ptwk1 >> this.XSF1) +
                (this.ptwk2 >> this.XSF2));

            this.genenv.call(this);
            let vv = (this.pvol + this.pexp + this.envwk) >> this.VOLS;
            if (vv <= 11) vv = 0; else vv = gexp(vv);
            this.genwave.call(this, buffer, vv, buffer.length);
        }
    }
}
