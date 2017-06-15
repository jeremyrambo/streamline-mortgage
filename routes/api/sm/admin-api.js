var express     = require( "express" ),
    viewdb      = require( "../db/view-db" ),
    utils       = require( "../../../utils/utils" ),
    config      = require( "../../../config" ),
    request     = require( "request" ),
    publisher   = require( "../pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

app.get( "/profits", function( req, response ){
  viewdb.q.getProfits(function( err, result){
    return responseHandler.get(response, err, result);
  });
});

app.get( "/logs", function( req, response ){
  viewdb.q.getLogs(function( err, result){
    return responseHandler.get(response, err, result);
  });
});
