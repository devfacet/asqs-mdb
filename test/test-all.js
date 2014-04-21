// Init reqs
/* jslint node: true */
'use strict';

process.argv.push('-c', 'config/test.json');

var asqsmdb = require('../app/'),
    utilex  = require('utilex')
;

// Tests
utilex.tidyLog('test-all.js');