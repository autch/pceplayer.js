(function () {
  'use strict';

  var m = /\bm=(.*?)(&|$)/.exec(window.location.search);
  var f = m && m[1];

  window.muslib.ui.ready(function () {
    $.getJSON('./list.json', function (data) {
      var $target = $('#file-list');
      $target.empty();
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var $tr = $('<a>').attr("href", "#").addClass("row list-group-item").data("item", item);

        $('<div>').addClass("col-xs-12 col-sm-7").append($('<h5>').addClass("list-group-item-heading").text(item.title == "" ? "[" + item.filename + "]" : item.title)).appendTo($tr);
        $('<div>').addClass("col-xs-12 col-sm-5").append($('<p>').addClass("list-group-item-text").text(item.title2)).addClass("title2").appendTo($tr);
        $tr.appendTo($target);

        if (f === item.filename) {
          window.muslib.ui.autoplay($tr);
          f = null;
        }
      }
    });
  });

})();
