describe('APIHandler extensions for remote storage plugin', function(){
  var apiHandler = require('../handler/APIHandler.js');

  var apiStub = {
    functions: {connect: [], error: []},
    connect: function(userAddress, bearerToken, callback) {callback()},
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
      apiHandler.handle("no-api-registered-yet", {}, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(4);
      expect(response.message).toEqual('no or wrong API Key');
    });

    it('refuses unknown functions', function(){
      apiHandler.setAPI(apiStub);
      apiHandler.handle("no-function-called-this-way", {}, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(4);
      expect(response.message).toEqual('no or wrong API Key');
    });

    it('checks for bearer token', function(){
      apiHandler.setAPI(apiStub);
      apiHandler.handle("connect", {}, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(4);
      expect(response.message).toEqual('no or wrong API Key');
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
      apiHandler.handle("error", params, req, res);
      expect(res.send).toHaveBeenCalled();
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(4);
      expect(response.message).toEqual('no or wrong API Key');
    });

  });  
});  
