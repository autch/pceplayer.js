'use strict';

import MDevice from "./mdevice.js";
import instDef from "./instdef.js";

export default class Mus {
    constructor(fs, max) {
        this.inst = instDef;
        this.MAXCH = max;
        this.finish = 0;

        this.music = new Array(this.MAXCH);
        for (let ch = 0; ch < this.MAXCH; ch++) {
            this.music[ch] = new MDevice(fs, ch);
            this.music[ch].SetInst(this.getInst(0));
        }
    }

    init() {
        this.finish = 1;
    }

    getDevice(i) {
        return this.music[i];
    }

    getInst(i) {
        return this.inst[i];
    }

    IsFinished() {
        return this.finish === 2;
    }

    Render(buffer, seq) {
        if (this.finish) {
            this.finish = 2;
            return;
        }

        for (let ch = 0; ch < this.MAXCH; ch++) {
            const mp = this.music[ch];
            mp.Render(buffer);
        }

        if (!seq.ProcSeq())
            this.finish = 2;
    }
}

