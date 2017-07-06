(function () {
  'use strict';

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var muslibSize = 128;
  var tmpbuf = new Int16Array(muslibSize);

  var probeDefaultBufferSize = function() {
    var ua = navigator.userAgent;

    if(/Linux/.test(ua)) {
      return 8192;
    }
    if(/Chrome/.test(ua)) {
      return 0; // use system default
    }
    if(/iPhone|iPod|iPad/.test(ua)) {
      return 2048;
    }
    if(/Safari/.test(ua)) {
      return 2048;
    }
    return 4096;
  };

  window.muslib.browser = {
    context: context,
    tmpbuf: tmpbuf,

    stopMusic: function (e) {
      if (window.muslib.instances) {
        var scrNode = window.muslib.instances.scrNode;
        if (scrNode) {
          scrNode.disconnect(0);
          scrNode.onaudioprocess = null;
        }
        window.muslib.instances = {};
      }
    },
    playMusic: function (href) {
      var unlockBuffer = context.createBuffer(1, 1, 22050);
      var unlockSrc = context.createBufferSource();
      unlockSrc.buffer = unlockBuffer;
      unlockSrc.connect(context.destination);
      unlockSrc.start(0);

      var request = new XMLHttpRequest();
      request.open('GET', href, true);
      request.responseType = 'arraybuffer';
      request.addEventListener('load', function () {
        var scrNode = context.createScriptProcessor(probeDefaultBufferSize(), 1, 1);
        var srcNode = context.createOscillator(); //context.createBufferSource();
        srcNode.connect(scrNode);
        scrNode.connect(context.destination);

        var muslib = new window.muslib.Muslib(context.sampleRate);

        window.muslib.instances = {
          muslib: muslib,
          srcNode: srcNode,
          scrNode: scrNode
        };

        muslib.PlayMusic(new Uint8Array(request.response));

        // console.log(muslib.seq.GetTitle(conv), muslib.seq.GetTitle2(conv));

        scrNode.onaudioprocess = function (ev) {
          var outbuf = ev.outputBuffer.getChannelData(0);

          if (muslib.IsFinished()) {
            scrNode.disconnect(0);
            scrNode.onaudioprocess = null;
            return;
          }

          for (var op = 0; op < outbuf.length;) {
            muslib.Render(tmpbuf);
            for (var i = 0; i < tmpbuf.length; i++) {
              outbuf[op++] = tmpbuf[i] / 32767.0;
              tmpbuf[i] = 0;
            }
          }
        };
        srcNode.start(0);
      });
      request.send();
    }
  };
})();
