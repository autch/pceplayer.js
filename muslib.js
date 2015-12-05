(function(root){

  'use strict';

  root.muslib = {};

  function Muslib(fs) {
    this.mus = new root.muslib.Mus(fs, 6);
    this.seq = new root.muslib.Seq(fs, 6);
  }

  Muslib.prototype.PlayMusic = function(seq) {
    this.seq.StartSeq(this.mus, seq);
  };

  Muslib.prototype.Render = function(buffer) {
    this.mus.Render(buffer, this.seq);
  };
  
  Muslib.prototype.IsFinished = function() {
    return this.mus.IsFinished();
  }

  root.muslib.Muslib = Muslib;

})((typeof window != "undefined") ? window : module.exports);
