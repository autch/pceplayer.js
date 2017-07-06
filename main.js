(function () {
  'use strict';

  var m = /\bm=(.*?)(&|$)/.exec(window.location.search);
  var f = m && m[1];

  window.muslib.ui.ready(function () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './list.json', true);
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
        tr.classList.add('row', 'list-group-item');
        tr.setAttribute('data-href', item.href);
        tr.setAttribute('data-filename', item.filename);
        tr.setAttribute('data-title', item.title);
        tr.setAttribute('data-title2', item.title2);

        var titleDiv = document.createElement('div');
        titleDiv.classList.add("col-xs-12", "col-sm-7");
        var title2Div = document.createElement('div');
        title2Div.classList.add("col-xs-12", "col-sm-5");

        var titleElem = document.createElement('h5');
        titleElem.classList.add('list-group-item-heading');
        titleElem.textContent = item.title == "" ? "[" + item.filename + "]" : item.title;
        titleDiv.appendChild(titleElem);
        tr.appendChild(titleDiv);
        var title2Elem = document.createElement('small');
        title2Elem.classList.add('list-group-item-text');
        title2Elem.textContent = item.title2;
        title2Div.appendChild(title2Elem);
        tr.appendChild(title2Div);
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
