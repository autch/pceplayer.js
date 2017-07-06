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
    delegate: function(el, evt, sel, handler) {
      el.addEventListener(evt, function(event) {
        var t = event.target;
        var h = true;
        while (t && t !== this) {
          if (t.matches(sel)) {
            h = handler.call(t, event);
            break;
          }
          t = t.parentNode;
        }
        return h;
      });
    },
    autoplay: function (tr) {
      window.setTimeout(function () {
        var event = new MouseEvent('click', { bubbles: true, cancelable: true });
        tr.dispatchEvent(event);
        window.scrollBy(0, tr.getBoundingClientRect().top + document.body.scrollTop - parseInt(getComputedStyle(document.body)["padding-top"]));
      }, 0);
    }
  };
  window.muslib.ui.ready(function () {
    var playHandler = function (e) {
      var event = new MouseEvent('click', { bubbles: true, cancelable: true });
      var tr = document.querySelector('.active')
      if(tr != null) tr.dispatchEvent(event);
    }, stopHandler = function (e) {
      window.muslib.browser.stopMusic();
      setAsPlay();
    };

    var btnPlay = document.getElementById('btn-play');
    var btnSpan = btnPlay.querySelector('span');

    var titleElem = document.getElementById('title');
    var title2Elem = document.getElementById('title2');

    var setAsPlay = function () {
      btnSpan.classList.remove('glyphicon-stop');
      btnSpan.classList.add('glyphicon-play');

      btnPlay.removeEventListener('click', stopHandler);
      btnPlay.addEventListener('click', playHandler);
    }, setAsStop = function () {
      btnSpan.classList.remove('glyphicon-play');
      btnSpan.classList.add('glyphicon-stop');

      btnPlay.removeEventListener('click', playHandler);
      btnPlay.addEventListener('click', stopHandler);
    };

    document.getElementById('title').addEventListener("click", function (e) {
      e.preventDefault();
      var tr = document.querySelector('.active');
      if(tr == null) return false;
      window.scrollTo(0, tr.getBoundingClientRect().top + document.body.scrollTop - parseInt(getComputedStyle(document.body)["padding-top"]));
      return false;
    });

    var playMusic = function (e) {
      var self = this;
      var item = {
        href: self.getAttribute('data-href'),
        filename: self.getAttribute('data-filename'),
        title: self.getAttribute('data-title'),
        title2: self.getAttribute('data-title2'),
      };

      window.muslib.browser.stopMusic();
      (function() {
        var tr = document.querySelector('.active');
        if(tr != null) tr.classList.remove('active');
      })();

      titleElem.textContent = (item.title == "") ? "[" + item.filename + "]" : item.title;
      if(title2Elem) title2Elem.textContent = item.title2;
      self.classList.add('active');
      setAsStop();

      window.muslib.browser.playMusic(item.href);
      e.preventDefault();
      return false;
    };

    window.muslib.ui.delegate(document.getElementById('file-list'), 'click', 'a.list-group-item', playMusic);
    setAsPlay();
  });
})();
