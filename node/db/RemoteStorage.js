/**
 * The RemoteStorage Module provides a database initalized for the given
 * storage name 
 */

/*
 * 2011 Max 'Azul' Wiehle for the unhosted project
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

var ueberDB = require("ueberDB");
// we'll remove the settings once we really move to remote storage
var settings = require("../utils/Settings");
var log4js = require('log4js');


// store all remote connections we have

var storages = {
  get: function (name) { return this[':'+name]; },
  set: function (name, value) { this[':'+name] = value; },
  remove: function (name) { delete this[':'+name]; }
};

/**
 * Get the database for the given name - later this will be the remoteStorage
 * identifier.
 * @param {name} the handle for the remote storage
 * @param {Function} callback - if null the function will return the storage.
 */
exports.get = function(name, callback)
{

  console.warn("accessing " + name);
  var storage = storages.get(name);
  if(storage != null)
  {
    if(callback != null) {
      callback(null, storage);
    }
    else{
      return storage;
    }
  }
  else
  {
    var db_settings = { 'filename' : './var/' + name + '.db' };
    console.warn("file " + db_settings['filename']);
    console.warn("type " + settings.dbType);
    var storage = new ueberDB.database(settings.dbType, db_settings, null, log4js.getLogger("remoteDB"));
    storage.init(function(err)
    {
      //there was an error while initializing the database, output it and stop 
      if(err)
      {
        console.error("ERROR: Problem while initalizing the database");
        console.error(err.stack ? err.stack : err);
      }
    });
    console.warn("storage " + storage);
    storages.set(name, storage);
    if(callback != null) {
      callback(null, storage);
    }
    else {
      return storage;
    }
  }
}
