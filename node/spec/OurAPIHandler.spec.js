describe('ourAPIHandler', function(){
  var apiHandler = require('../handler/OurAPIHandler.js');
  
  describe("units", function() {
    var apiStub = {
      functions: {connect: [], error: []},
      connect: function(callback) {callback()},
      error: function(callback) {callback("error")}
    }

    it('exports a handle function', function(){
      expect(typeof apiHandler.handle).toEqual("function");
    });

    describe('handles invalid input', function (){

      var req = {};
      var res = { send: function(){} };
      var params = { bearerToken: "bearerStub" };

      beforeEach(function(){
        this.spyOn(res, "send");
      });

      it('requires registering an api', function(){
        apiHandler.handle("no-api-registered-yet", null, req, res);
        expect(res.send.wasCalled).toEqual(true);
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(3);
        expect(response.message).toEqual('no api registered');
      });

      it('refuses unknown functions', function(){
        apiHandler.setAPI(apiStub);
        apiHandler.handle("no-function-called-this-way", null, req, res);
        expect(res.send.wasCalled).toEqual(true);
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(3);
        expect(response.message).toEqual('no such function');
      });

      it('checks for bearer token', function(){
        apiHandler.setAPI(apiStub);
        apiHandler.handle("connect", {}, req, res);
        expect(res.send.wasCalled).toEqual(true);
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(3);
        expect(response.message).toEqual('no bearer token send');
      });

      it('responds with a 0 if no error occured', function(){
        apiHandler.setAPI(apiStub);
        apiHandler.handle("connect", params, req, res);
        expect(res.send).toHaveBeenCalled();
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(0);
      });

      it('responds with a 2 if an error occured', function(){
        apiHandler.setAPI(apiStub);
        expect(function (){
          apiHandler.handle("error", params, req, res);
        }).toThrow("error");
        expect(res.send).toHaveBeenCalled();
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(2);
        expect(response.message).toEqual("internal error");
      });

    });  
    describe('integration', function(){
      var stubParams = { bearerToken: "bearerStub", userAddress: "test@stub.me"};
      var api = require('../db/OurAPI.js');
      var storageManager = require('../db/StorageManager.js');
      var remotestorage_node = {
        storageInfo: {api: 'testStub', template: 'stub://template.tl/{category}/'},
        getStorageInfo: function(address, cb) {cb(null, this.storageInfo)}
      }
      var req = {};
      var res = { send: function(){} };

      beforeEach(function(){

        require('../db/RemoteStorage').setUeberDB();
        storageManager.init();
        api.init(storageManager, remotestorage_node);
        apiHandler.setAPI(api);
        this.spyOn(res, "send");
      });

      it("creates a database record for the given account", function() {
        apiHandler.handle('connect', stubParams, req, res);
        expect(res.send).toHaveBeenCalled();
        var args = res.send.mostRecentCall.args;
        var response = args[0];
        expect(response.code).toEqual(0);
      });
      
    });
  });
});
