describe('ourAPI', function(){
  var api = require('../db/OurAPI.js');
  
  describe('connect with bearerToken', function(){
    
    var req = {};
    var res = {send: function(){}};
    var params;

    beforeEach(function(){
      this.spyOn(res, "send");

    });

    it('checks for existing token', function(){
    });

    it('creates initial token', function(){
    });

    it('', function(){
    });
  });
});
