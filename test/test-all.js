// Init reqs
/* jslint node: true */
/* global describe: false */
/* global it: false */
'use strict';

process.argv.push('-c', 'config/test.json');

var utilex = require('utilex');

// Tests

// Test for asqsmdb module
describe('asqsMDB', function() {

  if(!utilex.tidyConfig().error && utilex.tidyConfig().file) {
    it('should run without any error', function(done) {
      require('../app/');
      setTimeout(function() { done(); }, 5000);
    });
  } else {
    it('should run without any error (invalid file!)', function(done) {
      done();
    });
  }
});