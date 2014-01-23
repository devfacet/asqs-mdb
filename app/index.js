/*
 * Amazon SQS to MongoDB
 * Copyright (c) 2014 Fatih Cetinkaya (http://github.com/cmfatih/asqs-mdb) - All rights reserved.  
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

// Init reqs
/* jslint node: true */
'use strict';

var mUtilex   = require('utilex'),
    mAWS      = require('aws-sdk'),
    mXML2JS   = require('xml2js'),
    mMongoDB  = require("mongodb")
;

// Init vars
var gConfig,    // config
    gSQS,       // SQS interface
    gXMLParser, // XML parser
    gSQSRcvMsg, // SQS receive message - function
    gDB,        // db interface
    gDBCol      // db collection
;

// Init config
gConfig = mUtilex.tidyConfig().config;

if(mUtilex.tidyConfig().error)                  throw (mUtilex.tidyConfig().error || "Unexpected error! (config)");
if(!gConfig.aws     || !gConfig.aws.config)     throw 'Invalid AWS configuration! (' + JSON.stringify(gConfig.aws) + ')';
if(!gConfig.sqs     || !gConfig.sqs.config)     throw 'Invalid SQS configuration! (' + JSON.stringify(gConfig.sqs) + ')';
if(!gConfig.mongodb || !gConfig.mongodb.config) throw 'Invalid MongoDB configuration! (' + JSON.stringify(gConfig.mongodb) + ')';

// Init AWS
mAWS.config.update(gConfig.aws.config);

// Init SQS
gSQS = new mAWS.SQS(gConfig.sqs.config);

// Init XML parser
gXMLParser = new mXML2JS.Parser({attrkey: 'A$'});

// Init MongoDB
mMongoDB.MongoClient.connect(gConfig.mongodb.config.url, function(err, db) {
  if(err) throw 'DB connection could not be established! (' + err + ')';

  // Init vars
  gDB     = db;
  gDBCol  = db.collection(gConfig.mongodb.config.collection);

  // Receive Message
  gSQSRcvMsg = function gSQSRcvMsg() {

    gSQS.receiveMessage(gConfig.sqs.receiveMessage, function(err, data) {

      if(!err) {

        // Init vars
        var requestId   = (data && data.ResponseMetadata && data.ResponseMetadata.RequestId) ? data.ResponseMetadata.RequestId : null;
        var messages    = (data && data.Messages && data.Messages instanceof Array) ? data.Messages : [];
        var messagesCnt = messages.length;

        // Check messages
        if(messagesCnt > 0) {

          for(var i = 0; i < messages.length; i++) {

            // Init message
            var body = messages[i].Body || null;

            if(body) {
              gXMLParser.parseString(body, function(err, result) {
                if(!err) {
                  data.Messages[i].Body  = result;
                  data.Messages[i].error = null;
                  //console.log(data.Messages[i].Body.Notification.NotificationMetaData[0].UniqueId); // for debug
                }
                else {
                  data.Messages[i].error = {
                    "type": "error",
                    "code": "asqs-mdb-001",
                    "source": "gXMLParser.parseString",
                    "message": "XML parsing error! (" + requestId + " / " + i + " / " + err + ")"
                  };

                  mUtilex.tidyLog(data.Messages[i].error, 'JSON');
                }
              });
            }
            else {
              data.Messages[i].error = {
                "type": "error",
                "code": "asqs-mdb-002",
                "source": "gSQS.receiveMessage",
                "message": "Message body error! (" + requestId + " / " + i + ")"
              };

              mUtilex.tidyLog(data.Messages[i].error, 'JSON');
            }
          }

          // Init request
          if(requestId) {
            gDBCol.insert(data, function(err, docs) {
              if(!err) {
                mUtilex.tidyLog({
                  "type": "success",
                  "code": "asqs-mdb-003",
                  "source": "gDBCol.insert",
                  "message": "Request (" + requestId + " / " + messagesCnt + ")"
                }, 'JSON');
              }
              else {
                mUtilex.tidyLog({
                  "type": "error",
                  "code": "asqs-mdb-004",
                  "source": "gDBCol.insert",
                  "message": "DB error! (" + err + ")"
                }, 'JSON');
              }

              gSQSRcvMsg();
            });
          }
          else {
            mUtilex.tidyLog({
              "type": "error",
              "code": "asqs-mdb-005",
              "source": "gSQS.receiveMessage",
              "message": "Invalid request Id!"
            }, 'JSON');

            gSQSRcvMsg();
          }
        }
        else {
          mUtilex.tidyLog({
            "type": "success",
            "code": "asqs-mdb-006",
            "source": "gSQS.receiveMessage",
            "message": "No more message. (" + requestId + ")"
          }, 'JSON');

          setTimeout(function() { gSQSRcvMsg(); }, gConfig.sqs.misc.noMessageWaitTimeMS);
        }
      }
      else {
        mUtilex.tidyLog({
          "type": "error",
          "code": "asqs-mdb-007",
          "source": "gSQS.receiveMessage",
          "message": "SQS error! (" + err + ")"
        }, 'JSON');

        gSQSRcvMsg();
      }
    });
  };

  gSQSRcvMsg();
});