describe('ourAPI', function(){
  var api = require('../db/OurAPI.js');
  
  describe('connect with bearerToken', function(){
    
    var req = {};
    var res = {send: function(){}};
    var params;

    beforeEach(function(){
      this.spyOn(res, "send");

    });

    xit('checks for existing token', function(){
    });

    xit('creates initial token', function(){
    });

    xit('', function(){
    });
  });
});
