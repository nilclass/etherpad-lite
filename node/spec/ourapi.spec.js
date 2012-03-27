describe('ourapi', function(){
  var api = require('../handler/OurAPIHandler.js');

  it('exports a handle function', function(){
    expect(typeof api.handle).toEqual("function");
  });

  describe('handles invalid input', function (){

    var req = {};
    var res = {send: function(){}};

    beforeEach(function(){
      this.spyOn(res, "send");
    });

    it('refuses unknown functions', function(){
      api.handle("no-function-called-this-way", null, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(3);
      expect(response.message).toEqual('no such function');
    });

    it('checks for bearer token', function(){
      api.handle("connect", {}, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(3);
      expect(response.message).toEqual('no bearer token send');
    });
  });

  describe('connect with bearerToken', function(){
    
    var req = {};
    var res = {send: function(){}};
    var params;

    beforeEach(function(){
      this.spyOn(res, "send");

      params = {
        bearerToken: "bearer"
      }
    });

    it('responds with a 20x', function(){
      api.handle("connect", params, req, res);
      expect(res.send.wasCalled).toEqual(true);
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(0);
    });

    it('checks for existing token', function(){
    });

    it('creates initial token', function(){
    });

    it('exports a handle function', function(){
    });

    it('', function(){
    });
  });
});
