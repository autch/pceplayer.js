(function () {
    'use strict';

    const m = /\bm=(.*?)(&|$)/.exec(window.location.search);
    let f = m && m[1];

    MuslibUI.ready(function () {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './list.json', true);
        xhr.onload = function (pe) {
            if (this.status < 200 || this.status >= 400) {
                // error
                return;
            }

            const data = JSON.parse(this.response);
            const target = document.getElementById('file-list');
            target.innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const tr = document.createElement('a');

                tr.setAttribute('href', '#');
                tr.classList.add('row', 'list-group-item');
                tr.setAttribute('data-href', item.href);
                tr.setAttribute('data-filename', item.filename);
                tr.setAttribute('data-title', item.title);
                tr.setAttribute('data-title2', item.title2);

                const titleDiv = document.createElement('div');
                titleDiv.classList.add("col-xs-12", "col-sm-7");
                const title2Div = document.createElement('div');
                title2Div.classList.add("col-xs-12", "col-sm-5");

                const titleElem = document.createElement('h5');
                titleElem.classList.add('list-group-item-heading');
                titleElem.textContent = item.title === "" ? "[" + item.filename + "]" : item.title;
                titleDiv.appendChild(titleElem);
                tr.appendChild(titleDiv);
                const title2Elem = document.createElement('small');
                title2Elem.classList.add('list-group-item-text');
                title2Elem.textContent = item.title2;
                title2Div.appendChild(title2Elem);
                tr.appendChild(title2Div);
                target.appendChild(tr);

                if (f === item.filename) {
                    MuslibUI.autoplay(tr);
                    f = null;
                }
            }
        };
        xhr.onerror = function () {

        };
        xhr.send();
    });

})();
