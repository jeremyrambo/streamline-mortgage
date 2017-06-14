var express     = require( "express" ),
    smdb        = require( "../db/sm-db" ),
    utils       = require( "../../../utils/utils" ),
    config      = require( "../../../config" ),
    request     = require( "request" ),
    publisher   = require( "../pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting streamline mortgage routes" );


app.get( "/live", function(request, response, next) {
  smdb.q.connection_live( function(err, result) {
    setTimeout( function() {

      return responseHandler.get( response, err, result );
    }, 10000);
  });
});

app.get( "/mortgages", function(request, response, next) {
  smdb.q.mortgages( function(err, result) {
      return responseHandler.get( response, err, { response: result[0].count } );
  });
});

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST http://localhost:8080/api/apply/mortgage
 */
app.post( "/apply/mortgage", function( req, res ){

  console.log( 'hello world');
  request.post(config.services.credit.toString(), {}, function(err, svcResponse, body) {
      console.log(body)
      return responseHandler.post(request, res, err, '1')
    });
});
