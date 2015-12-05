jQuery(function () { // -*- mode: js2; encoding: utf-8; -*-
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();

  $.getJSON('./list.json', function(data) {
    var $target = $('#file-list');
    for(var i = 0; i < data.length; i++) {
      var item = data[i];
      var $tr = $('<tr>');

      $('<td>').text(item.name).appendTo($tr);
      var $button = $('<button>').addClass("btn btn-default btn-xs btn-pmd-play").attr("data-target", item.href).append($('<span>').addClass("glyphicon glyphicon-play").attr("aria-hidden", "true"));
      $('<td>').append($button).appendTo($tr);
      $tr.appendTo($target);
    }
  });
  
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
  }
  
  $(document).on("click", '.btn-pmd-play', function (e) {
    var $self = $(e.currentTarget);

    var unlockBuffer = context.createBuffer(1, 1, 22050);
    var unlockSrc = context.createBufferSource();
    unlockSrc.buffer = unlockBuffer;
    unlockSrc.connect(context.destination);
    unlockSrc.start(0);

    var request = new XMLHttpRequest();
    request.open('GET', $self.data("target"), true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load', function () {
      if(window.muslib.instances) {
        var scrNode = window.muslib.instances.scrNode;
        if(scrNode) {
          scrNode.disconnect(0);
          scrNode.onaudioprocess = null;        
        }
        window.muslib.instances = {};
      }

      var scrNode = context.createScriptProcessor(probeDefaultBufferSize(), 1, 1);
      var srcNode = context.createOscillator(); //context.createBufferSource();
      srcNode.connect(scrNode);
      scrNode.connect(context.destination);

      var muslib = new window.muslib.Muslib(context.sampleRate);
      var muslibSize = 128;

      window.muslib.instances = {
        muslib: muslib,
        srcNode: srcNode,
        scrNode: scrNode
      };

      muslib.PlayMusic(new Uint8Array(request.response));

      scrNode.onaudioprocess = function (ev) {
        var outbuf = ev.outputBuffer.getChannelData(0);
        var tmpbuf = new Int16Array(muslibSize);

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
  });
});
