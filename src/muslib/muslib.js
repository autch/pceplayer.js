'use strict';

import Mus from "./mus.js";
import Seq from "./seq.js";

export default class Muslib {
    constructor(fs) {
        this.mus = new Mus(fs, 6);
        this.seq = new Seq(fs, 6);
    }

    PlayMusic(seq) {
        this.seq.StartSeq(this.mus, seq);
    }

    Render(buffer) {
        this.mus.Render(buffer, this.seq);
    }

    IsFinished() {
        return this.mus.IsFinished();
    }
}
