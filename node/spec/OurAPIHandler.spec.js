describe('ourAPIHandler', function(){
  var apiHandler = require('../handler/OurAPIHandler.js');
  var api = require('../db/OurAPI.js');

  it('exports a handle function', function(){
    expect(typeof apiHandler.handle).toEqual("function");
  });

  describe('handles invalid input', function (){

    var req = {};
    var res = {send: function(){}};

    beforeEach(function(){
      this.spyOn(res, "send");
    });

    it('refuses unknown functions', function(){
      apiHandler.handle("no-function-called-this-way", null, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(3);
      expect(response.message).toEqual('no such function');
    });

    it('checks for bearer token', function(){
      apiHandler.handle("connect", {}, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(3);
      expect(response.message).toEqual('no bearer token send');
    });
    
    it('responds with a 20x', function(){
      var params = {
        bearerToken: "bearer"
      }
      apiHandler.handle("connect", params, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(0);
    });
  });
});
