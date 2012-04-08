var url = require('url'),
    http = require('http'),
    https = require('https'),
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
      storageManager.set(userAddress, storageInfo, bearerToken, cb);
    }
  });
}

function connectWithoutStorageInfo(userAddress, bearerToken, cb) {
  storageManager.get(userAddress, function(err, data) {
    if(err || !data) {
      cb("apierror", {reason: "no storage found for address given"});
      return;
    }
    storageManager.authenticate(userAddress, bearerToken, function(legit) {
      if(!legit) {
        cb("apierror", {reason: "illegit attempt to store bearerToken"});
        return;
      }
    });
  }); 
}
