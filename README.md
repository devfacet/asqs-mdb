## Amazon SQS to MongoDB

[asqs-mdb](http://github.com/cmfatih/asqs-mdb) is an application for 
handling Amazon Simple Queue Service (SQS) messages and saving into a MongoDB database.  

[![Build Status][travis-image]][travis-url] | [![NPM][npm-image]][npm-url]
---------- | ----------

### Installation

For latest release
```
npm install asqs-mdb
```

For HEAD
```
git clone https://github.com/cmfatih/asqs-mdb.git
```

Create a copy of the default config file and make necessary changes.
```
cp config/app.json config/test.json
```

Permissions
```
chmod 775 ../asqs-mdb/logs/
chmod 664 ../asqs-mdb/logs/app.log
```

Install packages
```
npm install
```

### Usage

#### Test
```
npm test
```

#### Examples

**Manual execution**
```
node app/index.js -c config/test.json &>> logs/app.log
```
-

**Cron job**
```
*/5 * * * * cd asqs-mdb/; node app/index.js -c config/test.json &>> logs/app.log
```

### Changelog

For all notable changes see [CHANGELOG.md](https://github.com/cmfatih/asqs-mdb/blob/master/CHANGELOG.md)

### License

Copyright (c) 2014 Fatih Cetinkaya (http://github.com/cmfatih/asqs-mdb)  
Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/asqs-mdb
[npm-image]: https://badge.fury.io/js/asqs-mdb.png

[travis-url]: https://travis-ci.org/cmfatih/asqs-mdb
[travis-image]: https://travis-ci.org/cmfatih/asqs-mdb.svg?branch=master