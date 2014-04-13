## Amazon SQS to MongoDB

[asqs-mdb](http://github.com/cmfatih/asqs-mdb) is an application for handling Amazon Simple Queue Service (SQS) messages and saving into a MongoDB database.  

asqs-mdb on [npm registry](http://npmjs.org/package/asqs-mdb)

### Installation

For latest release
```
npm install asqs-mdb
```

For HEAD
```
git clone https://github.com/cmfatih/asqs-mdb.git
```

Create a copy of default config file. (the new config file will be ignored by git)
```
cp config/app.json config/test.json
```

Permissions
```
find ../asqs-mdb/ -type f -exec chmod 644 {} +
find ../asqs-mdb/ -type d -exec chmod 755 {} +
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

#### Example
```
node app/index.js -c config/test.json &>> logs/app.log &
```

### Changelog

For all notable changes see [CHANGELOG.md](https://github.com/cmfatih/asqs-mdb/blob/master/CHANGELOG.md)

### License

Copyright (c) 2014 Fatih Cetinkaya (http://github.com/cmfatih/asqs-mdb)  
Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.
