/**
 * Controls storing the pad data to remote storages
 */

/*
 * 2011 Peter 'Pita' Martischka (Primary Technology Ltd)
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

exports.refresh = function(name, callback)
{
  var client = redis.createClient(settings.redis.port, settings.redis.host);
  client.auth(settings.redis.pwd);
  var remote_name=unhyphenify(name);
  console.warn("loading "+remote_name+" from db");
  client.get(remote_name, function(err, record)
  {
    if(ERR(err, callback)) {console.warn(err+':'+record); return;}
    record = JSON.parse(record);
    var params = {
      storageAddress: record.ownPadBackDoor || record.storageInfo.template.replace('{category}','documents'),
      bearerToken: record.bearerToken,
      storageApi: record.storageInfo.api
    }
    if(ERR(err, callback)) return;
    remote.init(name, params, function(err, _storage)
    {
      console.log("init from settings " + name);
      if(ERR(err, callback)) return;
      storages.set(name, _storage);
      callback(null, {storageStatus: 'ready'});
    });
  });
  client.quit();
}

//TODO: we might need a lib for this kind of stuff somewhere
var unhyphenify = function(string)
{
  if(string.indexOf('@') != -1) return string;
  var replacements = {dash: '-', dot: '.', at: '@'};
  parts=string.split('-');
  for(var i=1; i<parts.length; i+=2) {
    parts[i]=replacements[parts[i]];
  }
  return parts.join('');
}
