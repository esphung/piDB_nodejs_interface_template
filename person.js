/*
* @Author: home
* @Date:   2016-03-05 00:50:32
* @Last Modified by:   home
* @Last Modified time: 2016-03-05 01:01:54
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



	 // Example Constructor
	function Foo(bar) {
	  // always initialize all instance properties
	  this.bar = bar;
	  this.baz = 'baz'; // default value
	}
	// class methods
	Foo.prototype.fooBar = function() {
		console.log(this.bar)// test
	};
	// export the class
	module.exports = Foo;


	// constructor call
	var object = new Foo('Hello New Person');

	// call method
	object.fooBar();





  });
}());