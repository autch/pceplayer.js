(function () {
    'use strict';

    const m = /\bm=(.*?)(&|$)/.exec(window.location.search);
    let f = m && m[1];

    MuslibUI.ready(function () {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', window.json_url, true);
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
                tr.classList.add('list-group-item');
                tr.setAttribute('data-href', item.href);
                tr.setAttribute('data-filename', item.filename);
                tr.setAttribute('data-title', item.title);
                tr.setAttribute('data-title2', item.title2);

                const titleElem = document.createElement('h5');
                titleElem.classList.add('list-group-item-heading');
                titleElem.textContent = item.title === "" ? "[" + item.filename + "]" : item.title;
                tr.appendChild(titleElem);
                const title2Elem = document.createElement('small');
                title2Elem.classList.add('list-group-item-text');
                title2Elem.textContent = item.title2;
                tr.appendChild(title2Elem);
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
