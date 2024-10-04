import MuslibUI from './browser-ui.js';

const m = /\bm=(.*?)(&|$)/.exec(window.location.search);
let f = m && m[1];

MuslibUI.ready(function () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', window.json_url, true);
    xhr.onload = function (/*pe*/) {
        if (this.status < 200 || this.status >= 400) {
            // error
            return;
        }

        const data = JSON.parse(this.response);
        const target = document.getElementById('file-list');
        target.innerHTML = '';
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            const a = `<a href="#" class="list-group-item" data-href="${item.href}" data-filename="${item.filename}" data-title="${item.title}" data-title2="${item.title2}">`;
            const h5 = `<h5 class="list-group-item-heading">${item.title === "" ? "[" + item.filename + "]" : item.title}</h5>`;
            const small = `<small class="list-group-item-text">${item.title2}</small>`;
            const tr_html = `${a}${h5}${small}</a>`;
            target.innerHTML += tr_html;

            if (f === item.filename) {
                //MuslibUI.autoplay(tr);
                f = null;
            }
        }
    };
    xhr.onerror = function () {

    };
    xhr.send();
});
