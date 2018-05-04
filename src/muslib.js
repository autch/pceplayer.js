'use strict';

const mus = require('./mus.js');
const seq = require('./seq.js');

function Muslib(fs) {
    this.mus = new mus.Mus(fs, 6);
    this.seq = new seq.Seq(fs, 6);
}

Muslib.prototype.PlayMusic = function (seq) {
    this.seq.StartSeq(this.mus, seq);
};

Muslib.prototype.Render = function (buffer) {
    this.mus.Render(buffer, this.seq);
};

Muslib.prototype.IsFinished = function () {
    return this.mus.IsFinished();
};

exports.Muslib = Muslib;
