'use strict';

import gexp from "./gexp.js";

export default class Seq {
    constructor(fs, maxch) {
        this.FS2 = fs;
        this.MCOUNT = Math.floor(this.FS2 * 2.5 * 16 / 128 + 0.5);
        this.TATT_DRUMS = 1;
        this.TATT_NOOFF = 2;

        this.TSTA_PORTASW = 1;
        this.TSTA_INPORTA = 2;
        this.TSTA_LEG1 = 4;
        this.TSTA_LEG2 = 8;

        this.title = this.title2 = "";

        this.MAXSEQ = maxch;
        this.data = null;
        this.mus = null;

        this.tempo = 0;
        this.tempowk = 0;
        this.runf = 0;

        this.seqwk = [];
        this.cmd = [];
        this.initCommands();
    }

    SeqNop() {
    }

    getByte() {
        return this.data[this.seqptr++];
    }

    sex(v) { // Sign EXtend
        return (v << 24) >> 24;
    }

    getInt() {
        return this.sex(this.getByte());
    }

    getByteAt(ptr) {
        return this.data[ptr];
    }

    getAdrs() {
        const p0 = this.data[this.seqptr++];
        const p1 = this.data[this.seqptr++];
        return p0 | (p1 << 8);
    }

    getAdrsAt(addr) {
        const p0 = this.data[addr];
        const p1 = this.data[addr + 1];
        return p0 | (p1 << 8);
    }

    StartSeq(mus, buffer) {
        this.mus = mus;
        this.data = buffer;
        this.seqptr = 0;
        this.tempo = 120 << 4;
        this.tempowk = 0;
        this.runf = 1;

        let n = this.data[this.seqptr];
        if (n === 0) n = this.data[++this.seqptr];
        if (n > this.MAXSEQ) n = this.MAXSEQ;

        let s = 1;
        let i = 0;
        for (; i < n; i++, s += 2) {
            const psw = new SeqWk(this, i, buffer, this.getAdrsAt(this.seqptr + s), mus.getDevice(i));
            this.seqwk.push(psw);
        }
        for (; i < this.MAXSEQ; i++) {
            let psw = new SeqWk(this, i, buffer, 0, mus.getDevice(i));
            psw.run = 0;
            this.seqwk.push(psw);
        }

        s = 1 + this.getByteAt(this.seqptr) * 2;

        this.drumsbase = this.getAdrsAt(this.seqptr + s);
        this.titlebase = this.getAdrsAt(this.seqptr + s + 2);
        this.title2base = this.getAdrsAt(this.seqptr + s + 4);
    }

    getString(offset, conv) {
        let e;
        for (e = offset; this.data[e] !== 0x00; e++) {
            //
        }
        const r = this.data.slice(offset, e);

        if (typeof conv !== "undefined")
            return conv.call(this, r);
        else
            return r;
    }

    GetTitle(conv) {
        return this.getString(this.titlebase, conv);
    }

    GetTitle2(conv) {
        return this.getString(this.title2base, conv);
    }

    SeqPortaExecP(psw) {
        if ((psw.mdwk.ptwk1 += psw.porvv) >= 0) {
            psw.mdwk.ptwk1 = 0;
            psw.tsta &= ~this.TSTA_INPORTA;
        }
    }

    SeqPortaExecN(psw) {
        if ((psw.mdwk.ptwk1 -= psw.porvv) <= 0) {
            psw.mdwk.ptwk1 = 0;
            psw.tsta &= ~this.TSTA_INPORTA;
        }
    }

    SeqNote(psw, note) {
        const ntw = ((note + psw.trs) << 8) + psw.dtn;

        psw.cnt = psw.len;

        if ((psw.tsta & this.TSTA_LEG2) && psw.run === 2) {
            psw.mdwk.NotePitch(ntw);
        } else {
            psw.mdwk.NoteOn(ntw);
            psw.run = 2;
        }

        if ((psw.tsta & (this.TSTA_LEG1 | this.TSTA_LEG2)) === this.TSTA_LEG2) {
            psw.tsta &= ~this.TSTA_LEG2;
        }

        if (psw.tsta & this.TSTA_PORTASW) {
            let a = psw.porpd;
            if (a === 0) a = psw.lnote - note;
            psw.mdwk.ptwk1 = (a << (psw.mdwk.XSF1 + 8));
            if (a < 0) {
                psw.portament = this.SeqPortaExecP;
            } else {
                psw.portament = this.SeqPortaExecN;
            }
            psw.tsta |= this.TSTA_INPORTA;
        }

        psw.lnote = note;

        const len = psw.len;
        let a = 0;
        if (!(psw.tatt & this.TATT_NOOFF)) {
            a = (len * psw.gate) >> 12;
            if (a < 1) a = 1;
            else if (a >= len) a = len - 1;
        }

        psw.stop = a;
    }

    SeqNote2(psw) {
        let note = psw.getByte();
        if (note >= 0x80) note -= 0x80 - 12;
        this.SeqNote(psw, note);
    }

    SeqDrums(psw, note) {
        let np = psw.np;
        const ad = this.getAdrsAt(this.drumsbase + (note << 1));
        psw.nestd[np++] = 1;
        psw.nestd[np++] = psw.pseq_off;
        psw.nestd[np++] = ad;
        psw.pseq_off = ad;
        psw.np = np;
    }

    SeqRest(psw) {
        if (psw.run === 2) {
            psw.mdwk.NoteOff();
            psw.run = 1;
        }
        psw.cnt = psw.len;
    }

    SeqInst(psw) {
        psw.mdwk.SetInst(this.mus.getInst(psw.getByte()));
    }

    SeqTempo(psw) {
        this.tempo = psw.getByte() << 4;
    }

    SeqEnd(psw) {
        let np = psw.np;
        if (np === 0) {
            psw.run = 0;
            psw.cnt = 1;
            return;
        }

        np -= 3;
        if (--psw.nestd[np]) {
            psw.pseq_off = psw.nestd[np + 2];
        } else {
            psw.pseq_off = psw.nestd[np + 1];
            psw.np = np;
        }
    }

    SeqGate(psw) {
        psw.gate = (100 - psw.getByte()) * 41;
    }

    SeqJump(psw) {
        psw.pseq_off = psw.getAdrs();
    }

    SeqCall(psw) {
        let np = psw.np;
        const ad = psw.getAdrs();
        psw.nestd[np++] = psw.getByte();
        psw.nestd[np++] = psw.pseq_off;
        psw.nestd[np++] = ad;
        psw.pseq_off = ad;
        psw.np = np;
    }

    SeqRept(psw) {
        let np = psw.np;
        psw.nestd[np++] = psw.getByte();
        psw.nestd[np++] = psw.pseq_off;
        np++;
        psw.np = np;
    }

    SeqNext(psw) {
        const np = psw.np - 3;
        if (--psw.nestd[np]) {
            psw.nestd[np + 2] = psw.pseq_off;
            psw.pseq_off = psw.nestd[np + 1];
        } else {
            psw.np = np;
        }
    }

    SeqBreak(psw) {
        const np = psw.np - 3;
        if (psw.nestd[np] === 1) {
            psw.pseq_off = psw.nestd[np + 2];
            psw.np = np;
        }
    }

    SeqTrs(psw) {
        psw.trs = psw.getInt();
    }

    SeqEnv(psw) {
        let ar = psw.getByte(),
            dr = psw.getByte(),
            sl = psw.getByte(),
            sr = psw.getByte();
        psw.mdwk.SetEnv(ar, dr, sl, sr);
    }

    SeqVol(psw) {
        psw.mdwk.SetVol(psw.getByte());
    }

    SeqDtn(psw) {
        psw.dtn = psw.getInt();
    }

    SeqPortaPara(psw) {
        psw.porpd = psw.getInt();
        psw.porvv = gexp(psw.getByte() * 192 + 5 * 12 * 256) << psw.mdwk.XSF1;
        psw.porvv *= this.tempo;
        psw.porvv /= this.MCOUNT;
    }

    SeqPortaOn(psw) {
        psw.tsta |= this.TSTA_PORTASW;
    }

    SeqPortaOff(psw) {
        psw.tsta &= ~(this.TSTA_PORTASW | this.TSTA_INPORTA);
        psw.mdwk.ptwk1 = 0;
    }

    SeqTatt(psw) {
        psw.tatt = psw.getByte();
    }

    SeqVibrato(psw) {
        let depth = psw.getByte(),
            spd = psw.getByte(),
            t1 = psw.getByte(),
            t2 = psw.getByte();
        psw.mdwk.SetVib(depth, spd, t1, t2);
    }

    SeqPartFade(psw) {
        psw.pseq_off += 2;
    }

    SeqMasterFade(psw) {
        psw.pseq_off += 2;
    }

    SeqMasterVol(psw) {
        psw.pseq_off++;
    }

    SeqBend(psw) {
        psw.pseq_off += 2;
    }

    SeqLegOn(psw) {
        psw.tsta |= (this.TSTA_LEG1 | this.TSTA_LEG2);
    }

    SeqLegOff(psw) {
        psw.tsta &= ~this.TSTA_LEG1;
    }

    SeqExp(psw) {
        psw.mdwk.SetExp(psw.getByte());
    }

    SeqExpRel(psw) {
        psw.mdwk.SetExpRel(psw.getInt());
    }

    initCommands() {
        this.cmd = [
            this.SeqRest,
            this.SeqGate,
            this.SeqJump,
            this.SeqCall,
            this.SeqRept,
            this.SeqNext,
            this.SeqTrs,
            this.SeqTempo,
            this.SeqInst,
            this.SeqVol,
            this.SeqEnv,
            this.SeqDtn,
            this.SeqNote2,
            this.SeqPortaPara,
            this.SeqPortaOn,
            this.SeqPortaOff,

            this.SeqTatt,
            this.SeqVibrato,
            this.SeqMasterVol,
            this.SeqMasterFade,
            this.SeqPartFade,
            this.SeqBend,
            this.SeqBreak,
            this.SeqNop,
            this.SeqLegOn,
            this.SeqLegOff,
            this.SeqExp,
            this.SeqExpRel,
            this.SeqNop,
            this.SeqNop,
            this.SeqNop,
            this.SeqNop
        ];
    }

    ProcSeq() {
        for (let i = 0; i < this.MAXSEQ; i++) {
            let psw = this.seqwk[i];
            if (psw.run) {
                if (psw.tsta & this.TSTA_INPORTA) psw.portament.call(psw, psw);
            }
        }

        if ((this.tempowk -= this.tempo) >= 0) return this.runf;

        this.tempowk += this.MCOUNT;

        this.runf = 0;

        for (let i = 0; i < this.MAXSEQ; i++) {
            let psw = this.seqwk[i];

            this.runf += psw.run;

            if (psw.run) {
                if (!--psw.cnt) {
                    do {
                        let a = psw.getByte();
                        if (a >= 0xe0) {
                            const f = this.cmd[a - 0xe0];
                            f.call(this, psw);
                        } else if (a >= 0x80) {
                            if (psw.tatt & this.TATT_DRUMS) {
                                this.SeqDrums(psw, a - 0x80);
                            } else {
                                this.SeqNote(psw, a - 0x80 + 12);
                            }
                        } else if (a) {
                            if (a === 127) {
                                a = psw.getByte();
                                if (a < 127) a += 256;
                            }
                            psw.len = a;
                        } else {
                            this.SeqEnd(psw);
                        }
                    } while (!psw.cnt)
                } else {
                    if (psw.cnt === psw.stop && psw.run === 2 && !(psw.tsta & this.TSTA_LEG1)) {
                        psw.mdwk.NoteOff();
                        psw.run = 1;
                    }
                }
            }
        }

        return this.runf;
    }
}

class SeqWk {
    constructor(seq, ch, pseq, pseq_off, mdev) {
        this.seq = seq;
        this.pseq = pseq;
        this.pseq_off = pseq_off;
        this.porvv = 0;
        this.porpd = 0;
        this.lnote = 0;
        this.cnt = 1;
        this.len = 1;
        this.ch = ch;
        this.np = 0;
        this.trs = 0;
        this.run = 1;
        this.tatt = 0;
        this.tsta = 0;
        this.stop = 0;
        this.gate = 1 * 41;
        this.portament = function () {
        };
        this.mdwk = mdev;
        this.mdwk.SetupCh(ch);
        this.mdwk.SetInst(this.seq.mus.getInst(0));
        this.mdwk.SetVol(127 - ch * 16);
        this.mdwk.SetVib(0, 0, 0, 0);
        this.dtn = 0;

        this.nestd = new Array(32 * 3);
    }

    getByte() {
        return this.pseq[this.pseq_off++];
    }

    sex(v) { // Sign EXtend
        return (v << 24) >> 24;
    }

    getInt() {
        return this.sex(this.getByte());
    }

    getAdrs() {
        const p0 = this.pseq[this.pseq_off++];
        const p1 = this.pseq[this.pseq_off++];
        return p0 | (p1 << 8);
    }
}
