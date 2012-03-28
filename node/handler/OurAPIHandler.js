var ERR = require("async-stacktrace");
var api;

exports.setAPI = function(_api){
  api = _api;
}

exports.handle = function(functionName, fields, req, res)
{
  if(!api)
  {
    res.send({code: 3, message: "no api registered", data: null});
    return;
  }

  //check if this is a valid function name
  var isKnownFunctionname = false;
  for(var knownFunctionname in api.functions)
  {
    if(knownFunctionname == functionName)
    {
      isKnownFunctionname = true;
      break;
    }
  }
  
  //say goodbye if this is a unkown function
  if(!isKnownFunctionname)
  {
    res.send({code: 3, message: "no such function", data: null});
    return;
  }

  if(!fields || !fields["bearerToken"])
  {
    res.send({code: 3, message: "no bearer token send", data: null});
    return;
  }

  callAPI(functionName, fields, req, res);
}

//calls the api function
function callAPI(functionName, fields, req, res)
{
  //put the function parameters in an array
  var functionParams = [];
  for(var i=0;i<api.functions[functionName].length;i++)
  {
    functionParams.push(fields[api.functions[functionName][i]]);
  }
  
  //add a callback function to handle the response
  functionParams.push(function(err, data)
  {  
    // no error happend, everything is fine
    if(err == null)
    {
      if(!data)
        data = null;
    
      res.send({code: 0, message: "ok", data: data});
    }
    // parameters were wrong and the api stopped execution, pass the error
    else if(err.name == "apierror")
    {
      res.send({code: 1, message: err.message, data: null});
    }
    //an unkown error happend
    else
    {
      res.send({code: 2, message: "internal error", data: null});
      ERR(err);
    }
  });
  
  //call the api function
  api[functionName](functionParams[0],functionParams[1],functionParams[2],functionParams[3],functionParams[4]);
}
