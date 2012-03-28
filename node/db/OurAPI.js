var url = require('url'),
    http = require('http'),
    https = require('https'),
    redis = require('redis'),
    settings = require("../utils/Settings"),
    xml2js = require('xml2js'),
    remoteStorage = require('../db/remoteStorage-node');

exports.functions = { 
  "connect" : ["userAddress", "bearerToken"]
} 

exports.connect = function(userAddress, bearerToken, cb) {
  remoteStorage.getStorageInfo(userAddress, function(err, storageInfo) {
    if(err) {//might be updating a bearer token, but in that case we need to check it:
      initRedis(function(redisClient) {
        redisClient.get(userAddress, function(err, resp) {
          var data;
          try {
            data = JSON.parse(resp);
          } catch(e) {
          }
          if(data && data.storageInfo) {
            checkLegit(bearerToken, data.storageInfo, function(legit) {
              if(legit) {
                data.bearerToken=bearerToken;
                redisClient.set(userAddress, JSON.stringify(data), function(err, resp) {
                  cb();
                });
                redisClient.quit();
              } else {
                redisClient.quit();
                cb("apierror", {reason: "illegit attempt to store bearerToken"});
              }
            });
          } else {
            redisClient.quit();
            cb("apierror", {reason: "no storage info found for address given"});
          }
        }); 
      });
    } else {
      console.log(storageInfo);
      initRedis(function(redisClient) {
        redisClient.get(userAddress, function(err, resp) {
          var data;
          try {
            data = JSON.parse(resp);
          } catch(e) {
          }
          data = data || {};
          if(!data.storageInfo) {
            data.storageInfo=storageInfo;
          }
          if(!data.bearerToken) {//this way noone can actually do any harm with this.
            data.bearerToken=bearerToken;
          }
          redisClient.set(userAddress, JSON.stringify(data), function(err, resp) {
            cb();
          });
          redisClient.quit();
        });
      });
    }
  });
}

function initRedis(cb) {
  console.log('initing redis');
  var redisClient = redis.createClient(settings.redis.port, settings.redis.host);
  redisClient.on("error", function (err) {
    console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
  });
  redisClient.auth(settings.redis.pwd, function() {
    console.log('redis auth done');
    //redisClient.stream.on('connect', cb);
  });
  cb(redisClient);
}

function checkLegit(bearerToken, storageInfo, cb) {
  if(storageInfo.template) {
    //upgrade hack:
    if(storageInfo.template.indexOf('proxy.libredocs.org') != -1) {
      storageInfo.template = 'http://proxy.unhosted.org/CouchDB?'
        +storageInfo.template.substring('http://proxy.libredocs.org/'.length);
    }      
    var parts = storageInfo.template.split('{category}');
    if(parts.length==2) {
      var urlObj = url.parse(parts[0]+'documents'+parts[1]+'documents');

      var options = {
        host: urlObj.hostname,
        path: urlObj.path + (urlObj.search || ''),
        headers: {'Authorization': 'Bearer '+bearerToken}
      };
      var lib;
      if(urlObj.protocol=='http:') {
        lib = http;
        options.port = urlObj.port || 80;
      } else if(urlObj.protocol=='https:') {
        lib = https;
        options.port = urlObj.port || 443;
      } else {
        cb(false);
        return;
      }
      var req = lib.request(options, function(res) {
        if(res.statusCode==200 || res.statusCode==404) {
          cb(true);
        } else {
          cb(false);
        }
      });
      req.end();
      return;
    }
  }
  cb(false);
}

