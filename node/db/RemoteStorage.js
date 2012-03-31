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
    exports.settings = settings;
    callback(null, storage);
  });
}

exports.validate = function(storage, token, callback)
{
  if(storage.settings.bearerToken == token){
    callback(true);
    return;
  }
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

