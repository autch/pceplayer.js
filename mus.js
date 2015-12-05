(function(root){

  'use strict';

  root.muslib = root["muslib"] || {};

  function Mus(fs, max) {
    this.inst = root.muslib.InstDef;
    this.MAXCH = max;
    this.finish = 0;

    this.music = new Array(this.MAXCH);
    for(var ch = 0; ch < this.MAXCH; ch++) {
      this.music[ch] = new root.muslib.MDevice(fs, ch);
      this.music[ch].SetInst(this.getInst(0));
    }
  }

  Mus.prototype.init = function() {
    this.finish = 1;
  };

  Mus.prototype.getDevice = function(i) {
    return this.music[i];
  };
  Mus.prototype.getInst = function(i) {
    return this.inst[i];
  };

  Mus.prototype.IsFinished = function() {
    return this.finish == 2;
  };

  Mus.prototype.Render = function(buffer, seq) {
    if(this.finish) {
      this.finish = 2;
      return;
    }

    for(var ch = 0; ch < this.MAXCH; ch++) {
      var mp = this.music[ch];
      mp.Render(buffer);
    }

    if(!seq.ProcSeq())
      this.finish = 2;
  };

  root.muslib.Mus = Mus;

})((typeof window != "undefined") ? window : module.exports);
