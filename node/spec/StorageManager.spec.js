describe('StorageManager', function() {
  var storageManager = require('../db/StorageManager.js');

  var client = {
    get: function(){},
    set: function(){},
    auth: function(){},
    quit: function(){}
  };
  var remote = {
    storageOf: function(params){return {settings: params} ;},
    init: function(params, callback){
      callback(null, this.storageOf(params)) },
    validate: function(storage, token, callback) {
      callback(storage.settings.bearerToken != token, storage);
    }
  };
  storageManager.init(client, remote);
 
  var bearerToken = "bearer stub" 
  // typical record in redis
  var record = {
    storageInfo: {template: "my template/{category}/", api: "MyAPI"},
    bearerToken: bearerToken
  }
  // initialization params for RemoteStorage
  var params = {
    storageAddress : 'my template/documents/',
    bearerToken : bearerToken, 
    storageApi : 'MyAPI' 
  }

  describe("get", function() {
    it('retrieves values from the client', function(){
      spyOn(client, 'get').andCallFake(function(key, cb){cb(null, JSON.stringify(record))});
      storageManager.get("get me", function (err, value) {
        expect(err).toBeNull();
        expect(value).toEqual(remote.storageOf(params));
      });
      expect(client.get).toHaveBeenCalled();
    });

    it('chaches storage', function(){
      spyOn(client, 'get').andCallFake(function(key, cb){cb(null, JSON.stringify(record))});
      storageManager.get("cache me", function (err, value) {
        storageManager.get("cache me", function (err, value) {
          expect(err).toBeNull();
          expect(value).toEqual(remote.storageOf(params));
        });
      });
      // we only get it once from the client
      expect((client.get).argsForCall.length).toEqual(1);
    });
  });
  describe('set', function(){
    it('stores storageInfos to the client', function(){
      spyOn(client, 'set').andCallFake(function(key, value, cb){if(cb) cb(null, null);});
      storageManager.set("set me", record, function (err, state) {
        expect(err).toBeNull();
        expect(state.storageStatus).toEqual('ready');
      });
      expect(client.set).toHaveBeenCalled();
      expect(client.set.argsForCall[0]).toEqual(["set me", JSON.stringify(record)]);
    });

    it('caches storage infos', function(){
      spyOn(client, 'set').andCallFake(function(key, value, cb){if(cb) cb(null, null);});
      spyOn(client, 'get');
      storageManager.set("set and cache me", record, function (err, state) {
        storageManager.get("set and cache me", function (err, storage) {
          expect(err).toBeNull();
          expect(storage).toEqual(remote.storageOf(params));
        });
      });
      expect(client.get).not.toHaveBeenCalled();
    });

    it('overwrites existing storage', function() {
      spyOn(client, 'set').andCallFake(function(key, value, cb){if(cb) cb(null, null);});
      spyOn(client, 'get');
      var old_record = {
        storageInfo: record.storageInfo,
        bearerToken: "old"
      };
      storageManager.set("overwrite me", old_record, function (err, state) {
        storageManager.set("overwrite me", record, function (err, state) {
          storageManager.get("overwrite me", function (err, storage) {
            expect(err).toBeNull();
            expect(storage).toEqual(remote.storageOf(params));
          });
        });
      });
      expect(client.get).not.toHaveBeenCalled();
      expect(client.set.callCount).toEqual(2);
      expect(client.set.argsForCall[1]).toEqual(["overwrite me", 
        JSON.stringify(record)]);
    });

    it('refuses invalid storage', function() {
      spyOn(client, 'set');
      spyOn(remote, 'init').andCallFake(function(params, cb){
        cb('invalid', {reason: "Can't access storage."});
      });
      storageManager.set("set me", record, function (err, state) {
        expect(err).not.toBeNull();
        expect(state.storageStatus).toEqual('invalid');
      });
      expect(client.set).not.toHaveBeenCalled();
    });

  });

  describe("authenticate", function() {
    it('works with valid bearerTokens', function(){
      spyOn(remote, 'validate').andReturn(true);
      storageManager.set("auth me", record, function (err, state) {
        storageManager.authenticate("auth me", bearerToken, function(legit) {
          expect(legit).toBeTruthy();
          expect(remote.validate).toHaveBeenCalled();
        });
      });
    });

    it('refuses invalid bearerTokens', function(){
      spyOn(remote, 'validate').andReturn(false);
      storageManager.set("auth me", record, function (err, state) {
        storageManager.authenticate("auth me", bearerToken, function(legit) {
          expect(legit).toBeFalsy();
          expect(remote.validate).toHaveBeenCalled();
        });
      });
    });

  });
});
