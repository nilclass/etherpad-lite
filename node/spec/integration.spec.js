describe('integration', function(){

  var http = require('http');
  var url = require('url');
  // now let's see if the other setups also affect this...

  it('stores storage info on api call', function(done) {
    var options = url.parse("http://0.0.0.0:9001/api/1/connect?bearerToken=bla&userAddress=test@stub.me");
    console.log(JSON.stringify(options, null, 2));
    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
        expect(chunk).toEqual("response");
        done();
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      done();
    });
    req.end();
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
