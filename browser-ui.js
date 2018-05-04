(function () {
    'use strict';

    const browserIF = new window.MuslibBrowserInterface();
    window.muslibBrowserIF = browserIF;

    let MuslibUI = {
        ready: function (fn) {
            if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        },
        delegate: function (el, evt, sel, handler) {
            el.addEventListener(evt, function (event) {
                let t = event.target;
                let h = true;
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
                const event = new MouseEvent('click', {bubbles: true, cancelable: true});
                tr.dispatchEvent(event);
                window.scrollBy(0, tr.getBoundingClientRect().top + document.body.scrollTop - parseInt(getComputedStyle(document.body)["padding-top"]));
            }, 0);
        }
    };
    window.MuslibUI = MuslibUI;

    MuslibUI.ready(function () {
        const playHandler = function(e) {
            const event = new MouseEvent('click', {bubbles: true, cancelable: true});
            const tr = document.querySelector('.active');
            if (tr != null) tr.dispatchEvent(event);
        }, stopHandler = function(e) {
            browserIF.stopMusic();
            setAsPlay();
        };

        const btnPlay = document.getElementById('btn-play');
        const btnSpan = btnPlay.querySelector('span');

        const titleElem = document.getElementById('title');
        const title2Elem = document.getElementById('title2');

        const setAsPlay = () => {
            btnSpan.classList.remove('glyphicon-stop');
            btnSpan.classList.add('glyphicon-play');

            btnPlay.removeEventListener('click', stopHandler);
            btnPlay.addEventListener('click', playHandler);
        }, setAsStop = () => {
            btnSpan.classList.remove('glyphicon-play');
            btnSpan.classList.add('glyphicon-stop');

            btnPlay.removeEventListener('click', playHandler);
            btnPlay.addEventListener('click', stopHandler);
        };

        document.getElementById('title').addEventListener("click", function (e) {
            e.preventDefault();
            const tr = document.querySelector('.active');
            if (tr == null) return false;
            window.scrollTo(0, tr.getBoundingClientRect().top + document.body.scrollTop - parseInt(getComputedStyle(document.body)["padding-top"]));
            return false;
        });

        const playMusic = function(e) {
            const self = this;
            const item = {
                href: self.getAttribute('data-href'),
                filename: self.getAttribute('data-filename'),
                title: self.getAttribute('data-title'),
                title2: self.getAttribute('data-title2'),
            };

            browserIF.stopMusic();
            (function () {
                const tr = document.querySelector('.active');
                if (tr != null) tr.classList.remove('active');
            })();

            titleElem.textContent = (item.title === "") ? "[" + item.filename + "]" : item.title;
            if (title2Elem) title2Elem.textContent = item.title2;
            self.classList.add('active');
            setAsStop();

            browserIF.playMusicFromURL(item.href, () => {
                setAsPlay();
            });
            e.preventDefault();
            return false;
        };

        MuslibUI.delegate(document.getElementById('file-list'), 'click', 'a.list-group-item', playMusic);
        setAsPlay();
    });
})();
