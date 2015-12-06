(function(root){

  'use strict';

  root.muslib = root["muslib"] || {};

  // Sign EXtend
  var sex = function(v) {
    return ((v & 0xff) << 24) >> 24;
  }, sexS = function(v) {
    return ((v & 0xffff) << 16) >> 16;
  };

  function MDevice(fs, ch) {
    this.FS2 = fs /*>> 1*/;
    this.FOFS = Math.floor(Math.log2(this.FS2) * 12 * 256 + 0.5);
    this.ch = ch;

    this.VOLS = 1;
    this.ENVSTART = (-4 * 12 * 256) << this.VOLS;
    this.ENVSTOP = (-10 * 12 * 256) << this.VOLS;
    this.ENVRR = Math.floor((4000 << this.VOLS) * 16000.0 / this.FS2);
    this.T1CONST = 0x4000;

    this.IT_LOOP = 0x10;
    this.IT_FAST = 0x80;

    this.IBASE0 = 43008 + root.muslib.inst.PITCH440 - 69*256+60*256;

    this.XSF1 = 10;
    this.XSF2 = 14;
  }

  // Tone Generators

  MDevice.prototype.MakeWaveLP = function(buffer, vv, cnt) {
    var tbl = this.data;
    var cc = this.freqwk;
    var p = 0;
    do {
      var o = (cc >>> 14);
      var x = (cc & 0x3fff);
      var d1 = tbl[o];
      var d2 = tbl[o + 1];
      if((cc += this.freq) >= this.loop_end) {
        cc -= this.loop_w;
      }
      d2 -= d1;
      d2 *= x;
      d2 >>= 14;
      d1 += d2;
      d1 *= vv;
      buffer[p++] += d1 >> 8;
    } while(--cnt);
    this.freqwk = cc;
  };

  MDevice.prototype.MakeWaveNL = function(buffer, vv, cnt) {
    var tbl = this.data;
    var cc = this.freqwk;
    var p = 0;
    do {
      var o = (cc >>> 14);
      var x = (cc & 0x3fff);
      var d1 = tbl[o];
      var d2 = tbl[o + 1];
      if((cc += this.freq) >= this.loop_end) {
        this.freq = 0;
        return;
      }
      d2 -= d1;
      d2 *= x;
      d2 >>= 14;
      d1 += d2;
      d1 *= vv;
      buffer[p++] += d1 >> 8;
    } while(--cnt);
    this.freqwk = cc;
  };

  MDevice.prototype.MakeWaveSQR = function(buffer, vv, cnt) {
    var cc = this.freqwk;
    var p = 0;
    vv >>= 1;
    do {
      buffer[p++] += sexS((cc & 0x8000) ? vv : -vv);
      cc += this.freq;
    } while(--cnt);
    this.freqwk = cc;
  };

  MDevice.prototype.MakeWaveSAW = function(buffer, vv, cnt) {
    var cc = this.freqwk;
    var p = 0;
    do {
      var aa = sexS(cc);
      buffer[p++] += sexS((aa * vv) >> 16);
      cc += this.freq;
    } while(--cnt);
    this.freqwk = cc;
  };

  MDevice.prototype.MakeWaveTRI = function(buffer, vv, cnt) {
    var cc = sexS(this.freqwk);
    var p = 0;
    vv >>= 1;
    do {
      var dd = cc * vv;
      if(cc < 0) dd = -dd;
      dd -= vv << 14;
      buffer[p++] += sexS(dd >> 14);
      cc = sexS(cc + sexS(this.freq));
    } while(--cnt);
    this.freqwk = sexS(cc);
  };

  // Envelope Generators

  MDevice.prototype.setEnvSpeed = function(n) {
    return root.muslib.gexp(n * 192 + 4 * 12 * 256) << this.VOLS;
  };
  MDevice.prototype.setEnvSpeed2 = function(n) {
    return Math.floor(this.setEnvSpeed(n) * 16000.0 / this.FS2);
  };

  MDevice.prototype.genEnvR = function() {
    if((this.envwk -= this.ENVRR) < this.ENVSTOP) {
      this.envwk = this.ENVSTOP;
      this.freq = 0;
    }
  };
  MDevice.prototype.genEnvS = function() {
    if((this.envwk -= this.envSR) < this.ENVSTOP) {
      this.envwk = this.ENVSTOP;
      this.freq = 0;
    }
  };
  MDevice.prototype.genEnvD = function() {
    if((this.envwk -= this.envDR) < this.envSL) {
      this.genenv = this.genEnvS;
    }
  };
  MDevice.prototype.genEnvA = function() {
    if((this.envwk += this.envAR) > 0) {
      this.envwk = 0;
      this.genenv = this.genEnvD;
    }
  };
  MDevice.prototype.genEnvInit = function() {
    this.envwk = this.envAR ? this.ENVSTART : 0;
    this.genenv = this.genEnvA;
  };

  MDevice.prototype.SetEnv = function(ar, dr, sl, sr) {
    if(sl > 127) sl = 127;
    this.envSL = (sl - 127) * (192 * (1 << this.VOLS));
    this.envAR = this.setEnvSpeed2(ar);
    this.envDR = this.setEnvSpeed2(dr);
    this.envSR = this.setEnvSpeed2(sr);
  };

  // Vibrato Generators

  MDevice.prototype.setVibSpeed = function(n) {
    return root.muslib.gexp(n * 192 + 8 * 12 * 256);
  };
  MDevice.prototype.setVibSpeed2 = function(n) {
    return Math.floor(this.setVibSpeed(n) * 16000.0 / this.FS2);
  };

  MDevice.prototype.genVibS2 = function() {
    var a = sexS(this.vibwk += this.vibvv);
    if(a < 0) a = -a;
    a = 0x4000 - a;
    this.ptwk2 = (a * this.vibdpwk) >> 3;
  };
  MDevice.prototype.genVibS1 = function() {
    if((this.vibdpwk +=this.vibv2) >= this.vibdpe) {
      this.genvib = this.genVibS2;
      this.vibdpwk = this.vibdpe;
    }
    this.genVibS2();
  };
  MDevice.prototype.genVibS0 = function() {
    if((this.vibdpwk += this.vibv1) >= this.T1CONST) {
      this.genvib = this.genVibS1;
      this.vibwk = 0;
      this.vibdpwk = 0;
    }
  };

  MDevice.prototype.genVibInit = function() {
    this.genvib = this.genVibS0;
    this.vibdpwk = 0;
  };

  MDevice.prototype.SetVib = function(depth, spd, t1, t2) {
    this.vibdpe = depth * 12 * 8;
    this.vibvv = this.setVibSpeed2(spd);
    this.vibv1 = this.setVibSpeed2(t1);
    this.vibv2 = this.setVibSpeed2(t2);
  };

  // Instruments

  MDevice.prototype.SetInst = function(inst) {
    this.data = inst.data;
    this.loop_end = inst.loop_end;
    this.loop_w = inst.loop_end - inst.loop_top;
    this.freq = 0;
    this.ipitch = inst.pitch_fs - inst.pitch_org + (this.IBASE0 - this.FOFS);
    this.envAR = 0;

    if(inst.wtype & this.IT_FAST) {
      switch(inst.param) {
        case 0: this.genwave = this.MakeWaveSQR; break;
        case 1: this.genwave = this.MakeWaveSAW; break;
        case 2: this.genwave = this.MakeWaveTRI; break;
      }
    } else if(inst.wtype & this.IT_LOOP) {
      this.genwave = this.MakeWaveLP;
    } else {
      this.genwave = this.MakeWaveNL;
    }
  };

  MDevice.prototype.SetVol = function(vol) {
    this.pvol = (vol * 192 + 11 * 12 * 256) << this.VOLS;
    this.pexp = 0;
  };
  MDevice.prototype.SetExp = function(exp) {
    exp -= 127;
    this.pexp = (exp * 192) << this.VOLS;
  };
  MDevice.prototype.SetExpRel = function(expr) {
    this.pexp += (expr * 192) << this.VOLS;
  };

  // Synth

  MDevice.prototype.NoteOn = function(pitch) {
    this.freqwk = 0;
    this.ptwk1 = 0;
    this.ptwk2 = 0;
    this.cpitch = this.ipitch + pitch;
    this.freq = 1;
    this.genEnvInit();
    this.genVibInit();
  };

  MDevice.prototype.NotePitch = function(pitch) {
    this.cpitch = this.ipitch + pitch;
  };

  MDevice.prototype.NoteOff = function() {
    this.genenv = this.genEnvR;
  };

  MDevice.prototype.SetupCh = function(ch) {
    this.ch = ch;
  };

  MDevice.prototype.Render = function(buffer) {
    if(this.freq) {
      this.genvib.call(this);
      this.freq = root.muslib.gexp(this.cpitch +
                                   (this.ptwk1 >> this.XSF1) +
                                   (this.ptwk2 >> this.XSF2));

      this.genenv.call(this);
      var vv = (this.pvol + this.pexp + this.envwk) >> this.VOLS;
      if(vv <= 11) vv = 0; else vv = root.muslib.gexp(vv);
      this.genwave.call(this, buffer, vv, buffer.length);
    }
  };

  root.muslib.MDevice = MDevice;

})((typeof window != "undefined") ? window : module.exports);
