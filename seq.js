(function(root) {

  'use strict';

  root.muslib = root["muslib"] || {};

  function Seq(fs, maxch) {
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
  function SeqWk(ch, pseq, pseq_off, mdev) {
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
    this.portament = function(psw) {};
    this.mdwk = mdev;
    this.mdwk.SetupCh(ch);
    this.mdwk.SetInst(0);
    this.mdwk.SetVol(127 - ch * 16);
    this.mdwk.SetVib(0, 0, 0, 0);
    this.dtn = 0;

    this.nestd = new Array(32 * 3);
  }
  SeqWk.prototype.getByte = function() {
    return this.pseq[this.pseq_off++];
  };
  SeqWk.prototype.sex = function(v) { // Sign EXtend
    return (v << 24) >> 24;
  };
  SeqWk.prototype.getInt = function() {
    return this.sex(this.getByte());
  };
  SeqWk.prototype.getAdrs = function() {
    var p0, p1;
    p0 = this.pseq[this.pseq_off++];
    p1 = this.pseq[this.pseq_off++];
    return p0 | (p1 << 8);
  };

  Seq.prototype.SeqNop = function(psw) {};

  Seq.prototype.getByte = function() {
    return this.data[this.seqptr++];
  };
  Seq.prototype.sex = function(v) { // Sign EXtend
    return (v << 24) >> 24;
  };
  Seq.prototype.getInt = function() {
    return this.sex(this.getByte());
  };
  Seq.prototype.getByteAt = function(ptr) {
    return this.data[ptr];
  };
  Seq.prototype.getAdrs = function() {
    var p0, p1;
    p0 = this.data[this.seqptr++];
    p1 = this.data[this.seqptr++];
    return p0 | (p1 << 8);
  };
  Seq.prototype.getAdrsAt = function(addr) {
    var p0, p1;
    p0 = this.data[addr];
    p1 = this.data[addr + 1];
    return p0 | (p1 << 8);
  };
  Seq.prototype.StartSeq = function(mus, buffer) {
    this.mus = mus;
    this.data = buffer;
    this.seqptr = 0;
    this.tempo = 120 << 4;
    this.tempowk = 0;
    this.runf = 1;

    var n = this.data[this.seqptr];
    if(n == 0) n = this.data[++this.seqptr];
    if(n > this.MAXSEQ) n = this.MAXSEQ;

    var s = 1;

    for(var i = 0; i < n; i++, s += 2) {
      var psw = new SeqWk(i, buffer, this.getAdrsAt(this.seqptr + s), mus.getDevice(i));
      this.seqwk.push(psw);
    }
    for(; i < this.MAXSEQ; i++) {
      var psw = new SeqWk(i, buffer, 0, mus.getDevice(i));
      psw.run = 0;
      this.seqwk.push(psw);
    }

    s = 1 + this.getByteAt(this.seqptr) * 2;

    this.drumsbase = this.getAdrsAt(this.seqptr + s);
    this.titlebase = this.getAdrsAt(this.seqptr + s + 2);
    this.title2base = this.getAdrsAt(this.seqptr + s + 4);
  };

  Seq.prototype.SeqPortaExecP = function(psw) {
    if((psw.mdwk.ptwk1 += psw.porvv) >= 0) {
      psw.mdwk.ptwk1 = 0;
      psw.tsta &= ~this.TSTA_INPORTA;
    }
  };
  Seq.prototype.SeqPortaExecN = function(psw) {
    if((psw.mdwk.ptwk1 -= psw.porvv) <= 0) {
      psw.mdwk.ptwk1 = 0;
      psw.tsta &= ~this.TSTA_INPORTA;
    }
  };
  Seq.prototype.SeqNote = function(psw, note) {
    var ntw = ((note + psw.trs) << 8) + psw.dtn;

    psw.cnt = psw.len;

    if((psw.tsta & this.TSTA_LEG2) && psw.run == 2) {
      psw.mdwk.NotePitch(ntw);
    } else {
      psw.mdwk.NoteOn(ntw);
      psw.run = 2;
    }

    if((psw.tsta & (this.TSTA_LEG1 | this.TSTA_LEG2)) == this.TSTA_LEG2) {
      psw.tsta &= ~this.TSTA_LEG2;
    }

    if(psw.tsta & this.TSTA_PORTASW) {
      var a = psw.porpd;
      if(a == 0) a = psw.lnote - note;
      psw.mdwk.ptwk1 = (a << (psw.mdwk.XSF1 + 8));
      if(a < 0) {
        psw.portament = this.SeqPortaExecP;
      } else {
        psw.portament = this.SeqPortaExecN;
      }
      psw.tsta |= this.TSTA_INPORTA;
    }

    psw.lnote = note;

    var len = psw.len;
    var a = 0;
    if(!(psw.tatt & this.TATT_NOOFF)) {
      a = (len * psw.gate) >> 12;
      if(a < 1) a = 1;
      else if(a >= len) a = len - 1;
    }

    psw.stop = a;
  };
  Seq.prototype.SeqNote2 = function(psw) {
    var note = psw.getByte();
    if(note >= 0x80) note -= 0x80 - 12;
    this.SeqNote(psw, note);
  };
  Seq.prototype.SeqDrums = function(psw, note) {
    var np = psw.np;
    var ad = this.getAdrsAt(this.drumsbase + (note << 1));
    psw.nestd[np++] = 1;
    psw.nestd[np++] = psw.pseq_off;
    psw.nestd[np++] = ad;
    psw.pseq_off = ad;
    psw.np = np;
  };
  Seq.prototype.SeqRest = function(psw) {
    if(psw.run == 2) {
      psw.mdwk.NoteOff();
      psw.run = 1;
    }
    psw.cnt = psw.len;
  };
  Seq.prototype.SeqInst = function(psw) {
    psw.mdwk.SetInst(this.mus.getInst(psw.getByte()));
  };
  Seq.prototype.SeqTempo = function(psw) {
    this.tempo = psw.getByte() << 4;
  };
  Seq.prototype.SeqEnd = function(psw) {
    var np = psw.np;
    if(np == 0) {
      psw.run = 0;
      psw.cnt = 1;
      return;
    }

    np -= 3;
    if(--psw.nestd[np]) {
      psw.pseq_off = psw.nestd[np + 2];
    } else {
      psw.pseq_off = psw.nestd[np + 1];
      psw.np = np;
    }
  };
  Seq.prototype.SeqGate = function(psw) {
    psw.gate = (100 - psw.getByte()) * 41;
  };
  Seq.prototype.SeqJump = function(psw) {
    psw.pseq_off = psw.getAdrs();
  };
  Seq.prototype.SeqCall = function(psw) {
    var np = psw.np;
    var ad = psw.getAdrs();
    psw.nestd[np++] = psw.getByte();
    psw.nestd[np++] = psw.pseq_off;
    psw.nestd[np++] = ad;
    psw.pseq_off = ad;
    psw.np = np;
  };
  Seq.prototype.SeqRept = function(psw) {
    var np = psw.np;
    psw.nestd[np++] = psw.getByte();
    psw.nestd[np++] = psw.pseq_off;
    np++;
    psw.np = np;
  };
  Seq.prototype.SeqNext = function(psw) {
    var np = psw.np - 3;
    if(--psw.nestd[np]) {
      psw.nestd[np + 2] = psw.pseq_off;
      psw.pseq_off = psw.nestd[np + 1];
    } else {
      psw.np = np;
    }
  };
  Seq.prototype.SeqBreak = function(psw) {
    var np = psw.np - 3;
    if(psw.nestd[np] == 1) {
      psw.pseq_off = psw.nestd[np + 2];
      psw.np = np;
    }
  };
  Seq.prototype.SeqTrs = function(psw) {
    psw.trs = psw.getInt();
  };
  Seq.prototype.SeqEnv = function(psw) {
    var ar = psw.getByte(),
        dr = psw.getByte(),
        sl = psw.getByte(),
        sr = psw.getByte();
    psw.mdwk.SetEnv(ar, dr, sl, sr);
  };
  Seq.prototype.SeqVol = function(psw) {
    psw.mdwk.SetVol(psw.getByte());
  };
  Seq.prototype.SeqDtn = function(psw) {
    psw.dtn = psw.getInt();
  };
  Seq.prototype.SeqPortaPara = function(psw) {
    psw.porpd = psw.getInt();
    psw.porvv = root.muslib.gexp(psw.getByte() * 192 + 5 * 12 * 256) << psw.mdwk.XSF1;
    psw.porvv *= this.tempo;
    psw.porvv /= this.MCOUNT;
  };
  Seq.prototype.SeqPortaOn = function(psw) {
    psw.tsta |= this.TSTA_PORTASW;
  };
  Seq.prototype.SeqPortaOff = function(psw) {
    psw.tsta &= ~(this.TSTA_PORTASW | this.TSTA_INPORTA);
    psw.mdwk.ptwk1 = 0;
  };
  Seq.prototype.SeqTatt = function(psw) {
    psw.tatt = psw.getByte();
  };
  Seq.prototype.SeqVibrato = function(psw) {
    var depth = psw.getByte(),
        spd = psw.getByte(),
        t1 = psw.getByte(),
        t2 = psw.getByte();
    psw.mdwk.SetVib(depth, spd, t1, t2);
  };
  Seq.prototype.SeqPartFade = function(psw) {
    psw.pseq_off += 2;
  };
  Seq.prototype.SeqMasterFade = function(psw) {
    psw.pseq_off += 2;
  };
  Seq.prototype.SeqMasterVol = function(psw) {
    psw.pseq_off++;
  };
  Seq.prototype.SeqBend = function(psw) {
    psw.pseq_off += 2;
  };
  Seq.prototype.SeqLegOn = function(psw) {
    psw.tsta |= (this.TSTA_LEG1 | this.TSTA_LEG2);
  };
  Seq.prototype.SeqLegOff = function(psw) {
    psw.tsta &= ~this.TSTA_LEG1;
  };
  Seq.prototype.SeqExp = function(psw) {
    psw.mdwk.SetExp(psw.getByte());
  };
  Seq.prototype.SeqExpRel = function(psw) {
    psw.mdwk.SetExpRel(psw.getInt());
  };
  Seq.prototype.initCommands = function() {
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
  };
  Seq.prototype.ProcSeq = function() {
    for(var i = 0; i < this.MAXSEQ; i++) {
      var psw = this.seqwk[i];
      if(psw.run) {
        if(psw.tsta & this.TSTA_INPORTA) psw.portament.call(psw, psw);
      }
    }

    if((this.tempowk -= this.tempo) >= 0) return this.runf;

    this.tempowk += this.MCOUNT;

    this.runf = 0;

    for(var i = 0; i < this.MAXSEQ; i++) {
      var psw = this.seqwk[i];

      this.runf += psw.run;

      if(psw.run) {
        if(!--psw.cnt) {
          do {
            var a = psw.getByte();
            if(a >= 0xe0) {
              var f = this.cmd[a - 0xe0];
              f.call(this, psw);
            } else if(a >= 0x80) {
              if(psw.tatt & this.TATT_DRUMS) {
                this.SeqDrums(psw, a - 0x80);
              } else {
                this.SeqNote(psw, a - 0x80 + 12);
              }
            } else if(a) {
              if(a == 127) {
                a = psw.getByte();
                if(a < 127) a += 256;
              }
              psw.len = a;
            } else {
              this.SeqEnd(psw);
            }
          } while(!psw.cnt)
        } else {
          if(psw.cnt == psw.stop && psw.run == 2 && !(psw.tsta & this.TSTA_LEG1)) {
            psw.mdwk.NoteOff();
            psw.run = 1;
          }
        }
      }
    }

    return this.runf;
  };

  root.muslib.Seq = Seq;

})((typeof window != "undefined") ? window : module.exports);
