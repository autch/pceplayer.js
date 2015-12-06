// -*- mode: js2; encoding: utf-8; -*-

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

jQuery(function () {

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

  var stopMusic = function(e) {
    if(window.muslib.instances) {
      var scrNode = window.muslib.instances.scrNode;
      if(scrNode) {
        scrNode.disconnect(0);
        scrNode.onaudioprocess = null;
      }
      window.muslib.instances = {};
      $('.playing').removeClass("active playing");
      $('#title').text("");
      $('#title2').text("");
    }
  };

  $('#btn-stop').on("click", function(e) {
    stopMusic();
  });

  $('#title').on("click", function() {
    $('html, body').animate({
      scrollTop: $(".playing").offset().top - parseInt($('body').css("padding-top"))
    }, 1000);
  });

  var playMusic = function (e) {
    var $self = $(e.currentTarget);
    var item = $self.data("item");
    var justStop = $self.hasClass("playing");

    stopMusic();
    if(justStop) return;

    $('#title').text(item.title == "" ? "[" + item.filename + "]" : item.title);
    // $('#title2').text(item.title2);
    $self.addClass("playing active");

    var unlockBuffer = context.createBuffer(1, 1, 22050);
    var unlockSrc = context.createBufferSource();
    unlockSrc.buffer = unlockBuffer;
    unlockSrc.connect(context.destination);
    unlockSrc.start(0);

    var request = new XMLHttpRequest();
    request.open('GET', item.href, true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load', function () {

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
  };

  $.getJSON('./list.json', function(data) {
    var $target = $('#file-list');
    for(var i = 0; i < data.length; i++) {
      var item = data[i];
      var $tr = $('<div>').addClass("music-row row list-group-item").data("item", item);

      $tr.on("click", playMusic);
      $('<div>').addClass("col-xs-12 col-sm-7").append($('<h5>').text(item.title == "" ? "[" + item.filename + "]" : item.title)).appendTo($tr);
      $('<div>').addClass("col-xs-12 col-sm-5").append($('<p>').text(item.title2).addClass("title2")).appendTo($tr);
      $tr.appendTo($target);
    }
  });

  //$(document).on("click", '#file-list .music-row', playMusic);
  //$(document).on("touchend", '#file-list .music-row', playMusic);
});
