/*
* @Author: home
* @Date:   2016-03-05 00:20:18
* @Last Modified by:   home
* @Last Modified time: 2016-03-05 01:04:41
*/



// test hello world function to test jquery
(function () {
  'use strict';

  var env = require('jsdom').env, html = '<html><body><h1>Hello World!</h1><p class="hello">Hello jQuery!</body></html>';

  // first argument can be html string, filename, or url
  env(html, function (errors, window) {
    console.log(errors);

    var $ = require('jquery')(window)
      ;

    console.log($('.hello').text());





  });
}());


