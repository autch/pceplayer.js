(function () {
  'use strict';

  window.muslib.ui = {
    ready: function(fn) {
      if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }
    },
    autoplay: function (tr) {
      window.setTimeout(function () {
        var event = jQuery.Event('click');
        event.target = tr.get(0);
        $('#file-list').trigger(event);
        $('html, body').animate({
          scrollTop: tr.offset().top - parseInt($('body').css("padding-top"))
        }, 1000);
      }, 0);
    }
  };
  window.muslib.ui.ready(function () {
    var playHandler = function (e) {
      $('a.active').click();
    }, stopHandler = function (e) {
      window.muslib.browser.stopMusic();
      setAsPlay();
    };

    var setAsPlay = function () {
      $('#btn-play span').removeClass("glyphicon-stop").addClass("glyphicon-play");
      $('#btn-play').off("click").on("click", playHandler);
    }, setAsStop = function () {
      $('#btn-play span').removeClass("glyphicon-play").addClass("glyphicon-stop");
      $('#btn-play').off("click").on("click", stopHandler);
    };

    document.getElementById('title').addEventListener("click", function () {
      $('html, body').animate({
        scrollTop: $(".active").offset().top - parseInt($('body').css("padding-top"))
      }, 1000);
    });

    var playMusic = function (e) {
      var $self = $(e.currentTarget);
      var item = $self.data("item");

      window.muslib.browser.stopMusic();
      $('.active').removeClass('active');

      $('#title').text(item.title == "" ? "[" + item.filename + "]" : item.title);
      $('#title2').text(item.title2);
      $self.addClass("active");
      setAsStop();

      window.muslib.browser.playMusic(item.href);
      return false;
    };

    $('#file-list').on("click", 'a.list-group-item', playMusic);
    setAsPlay();
  });
})();
