describe('ourAPI', function() {
  var api = require('../db/OurAPI.js');
  var req = {};
  var res = {send: function(){}};
  var params;
  var storageManager = { store: {},
    get: function(key, cb) { cb(!this.store[key], this.store[key]); },
    set: function(key, value, cb) { this.store[key] = value; cb(); }
  };

  beforeEach(function(){
    this.spyOn(res, "send");
  });

  describe('with storage info from remoteStorage.getStorageInfo', function(){
    var userAddress = "myaddress@provider.tl";
    var bearerToken = "stub bearer token";
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
          expect(value.storageInfo).toEqual(storageInfo);
        });
      });
    });

    it('keeps existing token in redis', function(){
      original = storageInfo;
      original.template = "original template";
      storageManager.set(userAddress, {storageInfo: original}, function(){
        api.connect(userAddress, bearerToken, function(){
          storageManager.get(userAddress, function(err, value){
            expect(value.storageInfo).toEqual(original);
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
      api.checkLegit = function(bearerToken, storageInfo, callback) {
        callback(true);
      }
      storageManager.set(userAddress, {storageInfo: storageInfo}, function(){
        api.connect(userAddress, bearerToken, function(err, data){
          expect(err).toBeUndefined();
          storageManager.get(userAddress, function(err, value){
            expect(value.storageInfo).toEqual(storageInfo);
          });
        });
      });
    });

    it('refuses existing token if not legit', function(){
      api.checkLegit = function(bearerToken, storageInfo, callback) {
        callback(false);
      }
      storageManager.set(userAddress, {storageInfo: storageInfo}, function(){
        api.connect(userAddress, bearerToken, function(err, data){
          expect(err).toEqual("apierror");
          // nothing changed
          storageManager.get(userAddress, function(err, value){
            expect(value.storageInfo).toEqual(storageInfo);
          });
        });
      });
    });

  });

});
