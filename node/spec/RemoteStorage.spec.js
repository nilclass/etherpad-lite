describe('Remote Storage', function () {

  var remote = require('../db/RemoteStorage');

  // initialization params for RemoteStorage
  var bearerToken = "bearer stub";
  var params = {
    storageAddress: 'my template/documents/',
    bearerToken: bearerToken,
    storageApi: 'MyAPI'
  };

  var ueber = {
    remote: function(api, settings, wrapper, log){
      return ueber.storageOf(settings);
    },
    storageOf: function(params){
      return { 
        settings: params, 
        init: function(cb) { cb(this.settings.bearerToken != bearerToken); }
      };
    }
  };

  beforeEach(function() {
    remote.setUeberDB(ueber);
  });

  describe('init', function () {
    it("returns a valid storage", function() {
      remote.init(params, function(err, storage) {
        expect(err).toBeNull();
        expect(storage.settings).toEqual(params);
        expect(typeof storage.init).toEqual("function");
      });
    });

    it("returns error and reason on invalid input", function() {
      remote.init({}, function(err, storage) {
        expect(err).not.toBeNull();
        expect(storage.reason).toEqual("Can't access storage.");
      });
    });

  });

  describe('validate', function () {

    it("stores valid token", function() {
      var oldStorage = ueber.storageOf( {
        storageAddress: 'my template/documents/',
        bearerToken: 'outdated',
        storageApi: 'MyApi'
      });
      remote.validate(oldStorage, params.bearerToken, function(err, storage) {
        expect(err).toBeNull();
        expect(storage.settings.bearerToken).toEqual(params.bearerToken);
      });
    });

    it("refuses invalid token", function() {
      remote.init(params, function(err, storage) {
        remote.validate(storage, 'invalid bearer', function(err, storage) {
          expect(err).toEqual('invalid');
        });
      });
    });

    it("validates current token", function() {
      remote.init(params, function(err, storage) {
        remote.validate(storage, params.bearerToken, function(err, _storage) {
          expect(err).toBeNull();
          expect(_storage).toEqual(storage);
        });
      });
    });

  });
});
