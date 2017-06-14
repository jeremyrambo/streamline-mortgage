var express     = require( "express" ),
    smdb        = require( "../api/db/sm-db" ),
    utils       = require( "../../utils/utils" ),
    config      = require( "../../config" ),
    request     = require( "request" ),
    publisher   = require( "../api/pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting streamline mortgage routes" );


/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST http://localhost:5000/credit
 */
app.post( "/", function( request, response ){

  smdb.q.connection_live( function(err, result) {
    return responseHandler.get( response, err, result );
  });
});
