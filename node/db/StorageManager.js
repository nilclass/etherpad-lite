/**
 * Controls storing the pad data to remote storages
 */

/*
 * 2012 Max 'Azul' Wiehle for the unhosted project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var ERR = require("async-stacktrace");
var url = require("url");
var remote = require("./RemoteStorage");
var settings = require("../utils/Settings");
var redis = require("redis");


// cache all remote connections we have
var storages = {
  get: function (name) { return this[':'+name]; },
  set: function (name, value) { this[':'+name] = value; },
  remove: function (name) { delete this[':'+name]; }
};

exports.get = function(name, callback)
{
  console.log("get " + name);
  var storage = storages.get(name);
  // not in cache
  if(storage != null)
  {
    callback(null, storage);
    return;
  }
  exports.refresh(name, function(err, status){
    if(ERR(err, callback)) return;
    callback(null, storages.get(name));
  });
}

exports.set = function(name, record, callback){
  var client = injectedClient || redis.createClient(settings.redis.port, settings.redis.host);
  var params = {
    storageAddress: record.ownPadBackDoor || record.storageInfo.template.replace('{category}','documents'),
    bearerToken: record.bearerToken,
    storageApi: record.storageInfo.api
  }
  remote.init(name, params, function(err, _storage) {
    console.log("init from params " + name);
    if(ERR(err, callback)) return;
    storages.set(name, _storage);
    callback(null, {storageStatus: 'ready'});


  });

}

exports.init = function(name, record, callback)
{
  var client = injectedClient || redis.createClient(settings.redis.port, settings.redis.host);
  client.auth(settings.redis.pwd);
  var remote_name=unhyphenify(name);
  var params = paramsFromRecord(record);
  initAndCache(name, params, function(err, state){
    if(!err) client.set(remote_name, JSON.stringify(record));
    callback(err, state);
  });
}

function paramsFromRecord(record) {
  return {
    storageAddress: record.ownPadBackDoor || record.storageInfo.template.replace('{category}','documents'),
    bearerToken: record.bearerToken,
    storageApi: record.storageInfo.api
  }
}
exports.refresh = function(name, callback)
{
  var client = injectedClient || redis.createClient(settings.redis.port, settings.redis.host);
  client.auth(settings.redis.pwd);
  var remote_name=unhyphenify(name);
  console.warn("loading "+remote_name+" from db");
  client.get(remote_name, function(err, record)
  {
    if(ERR(err, callback)) {console.warn(err+':'+record); return;}
    record = JSON.parse(record);
    var params = paramsFromRecord(record);
    initAndCache(name, params, callback);
  });
  client.quit();
}

function initAndCache(name, params, callback){
  remote.init(name, params, function(err, _storage) {
    console.log("init from settings " + name);
    if(ERR(err, callback)) return;
    storages.set(name, _storage);
    callback(null, {storageStatus: 'ready'});
  });
}

//TODO: we might need a lib for this kind of stuff somewhere
function unhyphenify(string) {
  if(string.indexOf('@') != -1) return string;
  var replacements = {dash: '-', dot: '.', at: '@'};
  parts=string.split('-');
  for(var i=1; i<parts.length; i+=2) {
    parts[i]=replacements[parts[i]];
  }
  return parts.join('');
}

// for testing purposes
var injectedClient;
exports.injectClient = function(_client) {
  injectedClient = _client;
}
exports.injectRemote = function(_remote) {
  remote = _remote;
}


// just dumping it here for later use.
exports.checkLegit = function(bearerToken, storageInfo, cb) {
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

