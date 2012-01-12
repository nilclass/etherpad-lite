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

var ERR = require("async-stacktrace");
var ueberRemote = require("ueberRemoteStorage");
// we'll remove the settings once we really move to remote storage
var settings = require("../utils/Settings");
var log4js = require('log4js');




/**
 * Init the database for the given name - later this will be the remoteStorage
 * identifier.
 * @param {userName} the handle for the remote storage
 * @param {remoteSettings} - storageAddress, storageApi and bearerToken
 * @param {Function} callback - if null the function will return the storage.
 */
exports.init = function(name, settings, callback)
{
  var storage = new ueberRemote.remote(settings.storageApi, settings, null, log4js.getLogger("remoteDB"));
  storage.init(function(err)
  {
    //there was an error while initializing the remote storage
    if(ERR(err, callback)) return;
    callback(null, storage);
  });
}
