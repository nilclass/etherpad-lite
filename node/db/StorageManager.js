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
var remote = require("./RemoteStorage");
var db = require("./DB").db;

// store all remote connections we have

var storages = {
  get: function (name) { return this[':'+name]; },
  set: function (name, value) { this[':'+name] = value; },
  remove: function (name) { delete this[':'+name]; }
};

exports.init = function(name, settings, callback)
{
  remote.init(name, settings, function(err, storage)
  {
    console.log("init " + name);
    if(ERR(err, callback)) return;
    storages.set(name, storage);
    db.set("backend:"+name, settings);
    console.debug("settings: "+require("util").inspect(settings));
    callback(null, {storageStatus: "ready"});
  });
}

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

  console.warn("loading "+name+" from db");
  db.get("backend:"+name, function(err, settings)
  {
    if(ERR(err, callback)) return;
    console.debug("backend: "+require("util").inspect(settings));
    remote.init(name, settings, function(err, _storage)
    {
      console.log("init from settings " + name);
      if(ERR(err, callback)) return;
      storages.set(name, _storage);
      callback(null, _storage);
    });
  });
}
