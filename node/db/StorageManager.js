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
    console.warn("init " + name);
    if(ERR(err, callback)) return;
    storages.set(name, storage)
    callback(null, {storageStatus: "ready"});
  });
}

exports.get = function(name, callback)
{

  console.warn("get " + name);
  var storage = storages.get(name);
  if(storage != null)
  {
    if(callback != null)
    {
      callback(null, storage);
    }
    else
    {
      return storage;
    }
  }
  else
  {
    console.error("Remote storage " + name + " has not been initialized.");
    callback("Remote storage " + name + " has not been initialized.", null);
  }
}
