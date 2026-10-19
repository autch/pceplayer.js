// SPDX-License-Identifier: MIT
//
// 旧 pceplayer.js の埋め込み方法との互換用。
//   <script src="https://pceplayer.tnok.jp/embed.js" data-url="./list.json" data-width="400" data-height="300"></script>
// と書かれた場所に <pmd-playlist> を置く。新しく埋め込む場合は widget.js を直接使うこと。
(function () {
    var me = document.currentScript;
    if (!me) return;
    var el = document.createElement('pmd-playlist');
    el.setAttribute('src', new URL(me.getAttribute('data-url') || './list.json', document.baseURI).href);
    var px = function (v, d) { return /^\d+$/.test(v || '') ? v + 'px' : (v || d); };
    el.style.display = 'block';
    el.style.width = px(me.getAttribute('data-width'), '400px');
    el.style.height = px(me.getAttribute('data-height'), '320px');
    me.parentNode.insertBefore(el, me);

    var s = document.createElement('script');
    s.type = 'module';
    s.src = new URL('widget.js', me.src).href;
    document.head.appendChild(s);
})();
