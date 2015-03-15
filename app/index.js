/*
 * Amazon SQS to MongoDB
 * Copyright (c) 2014 Fatih Cetinkaya (http://github.com/cmfatih/asqs-mdb)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

var utilex  = require('utilex'),
    awssdk  = require('aws-sdk'),
    xml2js  = require('xml2js'),
    mongodb = require("mongodb");

var appConfig,
    xmlParser,
    sqsIface,   // SQS interface
    sqsRcvMsg;  // SQS receive message - function

appConfig = utilex.tidyConfig().config;
if(utilex.tidyConfig().error)                       throw (utilex.tidyConfig().error || "Unexpected error! (config)");
if(!appConfig.aws     || !appConfig.aws.config)     throw 'Invalid AWS configuration! (' + JSON.stringify(appConfig.aws) + ')';
if(!appConfig.sqs     || !appConfig.sqs.config)     throw 'Invalid SQS configuration! (' + JSON.stringify(appConfig.sqs) + ')';
if(!appConfig.mongodb || !appConfig.mongodb.config) throw 'Invalid MongoDB configuration! (' + JSON.stringify(appConfig.mongodb) + ')';

awssdk.config.update(appConfig.aws.config);
sqsIface  = new awssdk.SQS(appConfig.sqs.config);
xmlParser = new xml2js.Parser({attrkey: 'A$'});

// Connect to the db
mongodb.MongoClient.connect(appConfig.mongodb.config.url, function(err, db) {
  if(err) throw 'DB connection could not be established! (' + err + ')';

  var collection = db.collection(appConfig.mongodb.config.collection);

  // Receive Message
  sqsRcvMsg = function sqsRcvMsg() {

    sqsIface.receiveMessage(appConfig.sqs.receiveMessage, function(err, data) {

      if(!err) {

        var requestId   = (data && data.ResponseMetadata && data.ResponseMetadata.RequestId) ? data.ResponseMetadata.RequestId : null;
        var messages    = (data && data.Messages && data.Messages instanceof Array) ? data.Messages : [];
        var messagesCnt = messages.length;

        // Check messages
        if(messagesCnt > 0) {
          for(var i = 0; i < messages.length; i++) {
            var body = messages[i].Body || null;

            if(body) {
              xmlParser.parseString(body, function(err, result) {
                if(!err) {
                  data.Messages[i].Body  = result;
                  data.Messages[i].error = null;
                  //console.log(data.Messages[i].Body.Notification.NotificationMetaData[0].UniqueId); // for debug
                }
                else {
                  data.Messages[i].error = {
                    "type": "error",
                    "code": "asqs-mdb-001",
                    "source": "parseString",
                    "message": "XML parsing error! (" + requestId + " / " + i + " / " + err + ")"
                  };

                  utilex.tidyLog(data.Messages[i].error, 'JSON');
                }
              });
            }
            else {
              data.Messages[i].error = {
                "type": "error",
                "code": "asqs-mdb-002",
                "source": "receiveMessage",
                "message": "Message body error! (" + requestId + " / " + i + ")"
              };

              utilex.tidyLog(data.Messages[i].error, 'JSON');
            }
          }

          // request
          if(requestId) {
            collection.insert(data, function(err) { // (err, docs)
              if(!err) {
                utilex.tidyLog({
                  "type": "success",
                  "code": "asqs-mdb-003",
                  "source": "insert",
                  "message": "Request (" + requestId + " / " + messagesCnt + ")"
                }, 'JSON');
              }
              else {
                utilex.tidyLog({
                  "type": "error",
                  "code": "asqs-mdb-004",
                  "source": "insert",
                  "message": "DB error! (" + err + ")"
                }, 'JSON');
              }

              sqsRcvMsg();
            });
          }
          else {
            utilex.tidyLog({
              "type": "error",
              "code": "asqs-mdb-005",
              "source": "receiveMessage",
              "message": "Invalid request Id!"
            }, 'JSON');

            sqsRcvMsg();
          }
        }
        else {
          utilex.tidyLog({
            "type": "success",
            "code": "asqs-mdb-006",
            "source": "receiveMessage",
            "message": "No more message. (" + requestId + ")"
          }, 'JSON');

          setTimeout(function() { sqsRcvMsg(); }, appConfig.sqs.misc.noMessageWaitTimeMS);
        }
      }
      else {
        utilex.tidyLog({
          "type": "error",
          "code": "asqs-mdb-007",
          "source": "receiveMessage",
          "message": "SQS error! (" + err + ")"
        }, 'JSON');

        sqsRcvMsg();
      }
    });
  };

  sqsRcvMsg();
});