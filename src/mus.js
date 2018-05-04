'use strict';

const instDef = require('./instdef.js');
const mdevice = require('./mdevice.js');

function Mus(fs, max) {
    this.inst = instDef.InstDef;
    this.MAXCH = max;
    this.finish = 0;

    this.music = new Array(this.MAXCH);
    for (let ch = 0; ch < this.MAXCH; ch++) {
        this.music[ch] = new mdevice.MDevice(fs, ch);
        this.music[ch].SetInst(this.getInst(0));
    }
}

Mus.prototype.init = function () {
    this.finish = 1;
};

Mus.prototype.getDevice = function (i) {
    return this.music[i];
};
Mus.prototype.getInst = function (i) {
    return this.inst[i];
};

Mus.prototype.IsFinished = function () {
    return this.finish === 2;
};

Mus.prototype.Render = function (buffer, seq) {
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
};

exports.Mus = Mus;
