(function () {
  'use strict';

  var m = /\bm=(.*?)(&|$)/.exec(window.location.search);
  var f = m && m[1];

  window.muslib.ui.ready(function () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', window.json_url, true);
    xhr.onload = function () {
      if(this.status < 200 || this.status >= 400) {
        // error
        return;
      }

      var data = JSON.parse(this.response);
      var target = document.getElementById('file-list');
      target.innerHTML = '';
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var tr = document.createElement('a');

        tr.setAttribute('href', '#');
        tr.classList.add('list-group-item');
        tr.setAttribute('data-href', item.href);
        tr.setAttribute('data-filename', item.filename);
        tr.setAttribute('data-title', item.title);
        tr.setAttribute('data-title2', item.title2);
        
        var titleElem = document.createElement('h5');
        titleElem.classList.add('list-group-item-heading');
        titleElem.textContent = item.title == "" ? "[" + item.filename + "]" : item.title;
        tr.appendChild(titleElem);
        var title2Elem = document.createElement('small');
        title2Elem.classList.add('list-group-item-text');
        title2Elem.textContent = item.title2;
        tr.appendChild(title2Elem);
        target.appendChild(tr);

        if (f === item.filename) {
          window.muslib.ui.autoplay(tr);
          f = null;
        }
      }
    };
    xhr.onerror = function() {

    };
    xhr.send();
  });

})();
