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
var log4js = require('log4js');

exports.settings = null;

exports.setUeberDB = function(_ueber) {
  ueberRemote = _ueber || require("ueberRemoteStorage");
}

/**
 * Init the database for the given name - later this will be the remoteStorage
 * identifier.
 * @param {remoteSettings} - storageAddress, storageApi and bearerToken
 * @param {Function} callback - if null the function will return the storage.
 */
exports.init = function(settings, callback)
{
  var storage = new ueberRemote.remote(settings.storageApi, settings, null, log4js.getLogger("remoteDB"));
  storage.init(function(err)
  {
    //there was an error while initializing the remote storage
    if(err){
      callback('invalid', {reason: "Can't access storage."});
      return;
    }
    exports.settings = settings;
    callback(null, storage);
  });
}

exports.validate = function(storage, token, callback)
{
  if(storage.settings.bearerToken == token){
    callback(null, storage);
    return;
  }
  var newSettings = {
    storageAddress: storage.settings.storageAddress,
    storageApi: storage.settings.storageApi,
    bearerToken: token
  }
  exports.init(newSettings, callback);
}

