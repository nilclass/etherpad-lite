describe('integration', function(){

  // now let's see if the other setups also affect this...
  
  xit('stores storage info on api call', function(done) {
     request("http://0.0.0.0:9001/api", function(error, response, body){
     });
  });

  xdescribe("lower level", function() {


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

    xit("creates a database record for the given account", function() {
      apiHandler.handle('connect', stubParams, req, res);
      expect(res.send).toHaveBeenCalled();
      var args = res.send.mostRecentCall.args;
      var response = args[0];
      expect(response.code).toEqual(0);
    });

  });
});  
