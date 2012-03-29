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
    api.init(storageManager, remoteStorage);

    it('keeps existing token in redist', function(){
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

    xit('creates initial token', function(){
    });

    xit('', function(){
    });
  });
});
