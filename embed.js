(function() {
    'use strict';

    const me = document.currentScript;

    const iframe = document.createElement('iframe');
    iframe.scrolling = 'no';
    iframe.frameBorder = 0;
    iframe.marginWidth = 0;
    iframe.marginHeight = 0;
    iframe.width = '400px';
    iframe.height = '320px';

    if(me.hasAttribute('data-width'))
        iframe.width = me.getAttribute('data-width');
    if(me.hasAttribute('data-height'))
        iframe.height = me.getAttribute('data-height');

    me.parentElement.insertBefore(iframe, me);

    const content = (function(){/*
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
  <title>muslib player</title>

  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7"
    crossorigin="anonymous">
  <style>
    #title2 { font-size: 80%; }
    a.list-group-item {
      padding: 4px 8px;
    }
    div.panel-footer {
      padding: 4px 15px;
    }
  </style>
  <script src="./dist/browser.dist.js"></script>
  <script>
    window.json_url = %JSON_URL%;
  </script>
</head>
<body style="height: 100vh;">
  <div class="container-fluid" style="height: 100%;">
    <div class="panel panel-default" style="display: flex; flex-flow: column; height: 100%;">
      <!-- Default panel contents -->
      <div class="panel-heading" style="flex: 0 1 auto;">
        <div class="row">
          <div class="col-xs-9">
            <p id="title"></p>
            <p id="title2"></p>
          </div>
          <div class="col-xs-3">
            <button id="btn-play" class="btn btn-primary btn-lg btn-block"><span class="glyphicon glyphicon-play"></span></button>
          </div>
        </div>
      </div>

      <div id="file-list" class="list-group" style="flex: 1 1 auto; overflow-y: scroll;">
      </div>
      <div class="panel-footer" style="flex: 0 1 auto;">
        <a target="_blank" href="https://github.com/autch/pceplayer.js">P/ECE PMD Web Player Widget</a>
      </div>
    </div>
  </div>
  <script src="./browser-ui.js"></script>
  <script src="./widget-main.js"></script>
</body>
</html>*/}).toString().replace(/(\n)/g, '').split('/*')[1].split('*/')[0].replace(/%JSON_URL%/, JSON.stringify(me.getAttribute('data-url')));

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
})();
