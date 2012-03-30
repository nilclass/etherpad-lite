describe('StorageManager', function() {
  var storageManager = require('../db/StorageManager.js');
  var client = {
    get: function(){},
    set: function(){},
    auth: function(){},
    quit: function(){}
  };
  var remote = {
    storageOf: function(params){return "Storage: " + JSON.stringify(params);},
    init: function(n,p,callback){callback(null, this.storageOf(p))}
  };
  storageManager.injectClient(client);
  storageManager.injectRemote(remote);
  // typical record in redis
  var record = {
    storageInfo: {template: "my template/{category}/", api: "MyAPI"},
    bearerToken: "bearer stub"
  }
  // initialization params for RemoteStorage
  var params = {
    storageAddress : 'my template/documents/',
    bearerToken : 'bearer stub', 
    storageApi : 'MyAPI' 
  }

  it('retrieves values from the client', function(){
    spyOn(client, 'get').andCallFake(function(key, cb){cb(null, JSON.stringify(record))});
    storageManager.get("get me", function (err, value) {
      expect(err).toBeNull();
      expect(value).toEqual(remote.storageOf(params));
    });
    expect(client.get).toHaveBeenCalled();
  });

  it('chaches storages on duplicate get', function(){
    spyOn(client, 'get').andCallFake(function(key, cb){cb(null, JSON.stringify(record))});
    storageManager.get("cache me", function (err, value) {
      expect(err).toBeNull();
      expect(value).toEqual(remote.storageOf(params));
      storageManager.get("cache me", function (err, value) {
        expect(err).toBeNull();
        expect(value).toEqual(remote.storageOf(params));
      });
    });
    // we only get it once from the client
    expect((client.get).argsForCall.length).toEqual(1);
  });
  describe('initializing', function(){
    it('stores storageInfos to the client', function(){
      spyOn(client, 'set').andCallFake(function(key, value, cb){if(cb) cb(null, null);});
      storageManager.init("set me", record, function (err, state) {
        expect(err).toBeNull();
        expect(state.storageStatus).toEqual('ready');
      });
      expect(client.set).toHaveBeenCalled();
      expect(client.set.argsForCall[0]).toEqual(["set me", JSON.stringify(record)]);
    });

    it('caches storage infos', function(){
      spyOn(client, 'set').andCallFake(function(key, value, cb){if(cb) cb(null, null);});
      spyOn(client, 'get');
      storageManager.init("set and cache me", record, function (err, state) {
        storageManager.get("set and cache me", function (err, storage) {
          expect(err).toBeNull();
          expect(storage).toEqual(remote.storageOf(params));
        });
      });
      expect(client.get).not.toHaveBeenCalled();
    });
  });

  xit('authenticates with identical bearerTokens', function(){
    storageManager.authenticate(userAddress, bearerToken, function(legit) {
      expect(legit).toBeTruthy();
    });
  });

  xit('authenticates with new bearerTokens', function(){
    storageManager.authenticate(userAddress, bearerToken, function(legit) {
      expect(legit).toBeTruthy();
      expect(storageManager.get(userAddress).settings.bearerToken).toEqual(bearerToken);
    });
  });

  xit('refuses invalid bearerTokens', function(){
    storageManager.authenticate(userAddress, bearerToken, function(legit) {
      expect(legit).toBeFalsy();
      expect(storageManager.get(userAddress).settings.bearerToken).toEqual(oldBearerToken);
    });
  });

  xit('initializes new storage', function() {
  });

  xit('init overwrites existing storage', function() {
  });

  xit('init refuses invalid storage', function() {
  });

});
