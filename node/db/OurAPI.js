var url = require('url'),
    http = require('http'),
    https = require('https'),
    redis = require('redis'),
    settings = require("../utils/Settings"),
    xml2js = require('xml2js'),
    remoteStorage,
    storageManager

// dependency injection to ease testing
exports.init = function(_storageManager, _remoteStorage){
  remoteStorage = _remoteStorage || require('../db/remoteStorage-node');
  storageManager = _storageManager || require('../db/StorageManager');
}

exports.functions = { 
  "connect" : ["userAddress", "bearerToken"]
} 

exports.connect = function(userAddress, bearerToken, cb) {
  remoteStorage.getStorageInfo(userAddress, function(err, storageInfo) {
    if(err) {//might be updating a bearer token, but in that case we need to check it:
      connectWithoutStorageInfo(userAddress, bearerToken, cb);
    } else {
      connectWithStorageInfo(userAddress, bearerToken, storageInfo, cb)
    }
  });
}

function connectWithoutStorageInfo(userAddress, bearerToken, cb) {
  storageManager.get(userAddress, function(err, data) {
    if(err || !data || !data.storageInfo) {
      cb("apierror", {reason: "no storage info found for address given"});
      return;
    }
    checkLegit(bearerToken, data.storageInfo, function(legit) {
      if(!legit) {
        cb("apierror", {reason: "illegit attempt to store bearerToken"});
        return;
      }
      data.bearerToken=bearerToken;
      storageManager.set(userAddress, data, function(err, resp) {
        cb();
      });
    });
  }); 
}

function connectWithStorageInfo(userAddress, bearerToken, storageInfo, cb) {
  console.log(storageInfo);
  storageManager.get(userAddress, function(err, data) {
    data = data || {};
    if(!data.storageInfo) {
      data.storageInfo=storageInfo;
    }
    if(!data.bearerToken) {//this way noone can actually do any harm with this.
      data.bearerToken=bearerToken;
    }
    storageManager.set(userAddress, data, function(err, resp) {
      cb();
    });
  });
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

