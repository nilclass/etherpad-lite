describe('API plugins for remote storage', function() {
  var api = require('../db/API.js');
  var req = {};
  var res = {send: function(){}, header: function(){} };
  var bearerToken = "stub bearer token";
  var validBearer = "valid bearer";
  var params;
  function storageOf(params) {
    return "Storage: " + JSON.stringify(params);
  }
  var storageManager = { store: {},
    get: function(name, cb) { cb(!this.store[name], this.store[name]); },
    set: function(name, info, bearer, cb) { this.store[name] = storageOf(info); cb(); },
    authenticate: function(name, bearer, cb) { cb(bearer == validBearer); }
  };

  beforeEach(function(){
    this.spyOn(res, "send");
  });

  describe('with storage info from remoteStorage.getStorageInfo', function(){
    var userAddress = "myaddress@provider.tl";
    var storageInfo = {
      api: "simple",
      template: "http://my.domain.tl/storage/{category}/",
      auth: "http://my.domain.tl/cors/auth/modal.html"
    }
    var remoteStorage = {
      getStorageInfo: function(address, cb) {cb(null, storageInfo)}
    }

    beforeEach(function(){
      api.init(storageManager, remoteStorage);
    });

    afterEach(function(){
      storageManager.store = {}
    });

    it('creates initial token', function(){
      api.connect(userAddress, bearerToken, function(){
        storageManager.get(userAddress, function(err, value){
          expect(value).toEqual(storageOf(storageInfo));
        });
      });
    });

    it('keeps existing token in redis', function(){
      original = storageInfo;
      original.template = "original template";
      storageManager.set(userAddress, original, bearerToken, function(){
        api.connect(userAddress, bearerToken, function(){
          storageManager.get(userAddress, function(err, value){
            expect(value).toEqual(storageOf(original));
          });
        });
      });
    });
    

  });

  describe('without storage info from remoteStorage.getStorageInfo', function(){
    var userAddress = "myaddress@provider.tl";
    var bearerToken = "stub bearer token";
    var storageInfo = {
      api: "simple",
      template: "http://my.domain.tl/storage/{category}/",
      auth: "http://my.domain.tl/cors/auth/modal.html"
    }
    var remoteStorage = {
      getStorageInfo: function(address, cb) {cb("not found", null)}
    }

    beforeEach(function(){
      api.init(storageManager, remoteStorage);
    });

    afterEach(function(){
      storageManager.store = {}
    });

    it('returns an error if no info was stored before', function(){
      api.connect(userAddress, bearerToken, function(err, data){
        expect(err).toEqual("apierror");
        expect(data.reason).toEqual("no storage found for address given");
      });
    });

    it('uses existing token if legit', function(){
      storageManager.set(userAddress, storageInfo, validBearer, function(){
        api.connect(userAddress, validBearer, function(err, data){
          expect(err).toBeUndefined();
          storageManager.get(userAddress, function(err, value){
            expect(value).toEqual(storageOf(storageInfo));
          });
        });
      });
    });

    it('refuses existing token if not legit', function(){
      storageManager.set(userAddress, storageInfo, validBearer, function(){
        api.connect(userAddress, bearerToken, function(err, data){
          expect(err).toEqual("apierror");
          // nothing changed
          storageManager.get(userAddress, function(err, value){
            expect(value).toEqual(storageOf(storageInfo));
          });
        });
      });
    });

  });

});
