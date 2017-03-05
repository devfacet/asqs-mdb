# Amazon SQS to MongoDB

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Amazon SQS to MongoDB is an application for handling Amazon Simple Queue Service (SQS)
messages and saving into a MongoDB database.

## Installation

```
npm install asqs-mdb
```

Create a copy of the default config file and make necessary changes.
```
cp config/app.json config/test.json
```

## Usage

```bash
node app/index.js -c config/test.json &>> logs/app.log

# Cron job
*/5 * * * * node app/index.js -c config/test.json &>> logs/app.log
```

## License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/asqs-mdb
[npm-image]: https://badge.fury.io/js/asqs-mdb.svg

[travis-url]: https://travis-ci.org/devfacet/asqs-mdb
[travis-image]: https://travis-ci.org/devfacet/asqs-mdb.svg?branch=master
