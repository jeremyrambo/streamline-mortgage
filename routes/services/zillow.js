var express     = require( "express" ),
	  compression = require( "compression" ),
	  bodyParser  = require( "body-parser" ),
    smdb        = require( "../api/db/sm-db" ),
    utils       = require( "../../utils/utils" ),
    config      = require( "../../config" ),
    request     = require( "request" ),
    publisher   = require( "../api/pub-sub/publisher" )
		dataGen     = require( "../../utils/generateData");

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting zillow service" );

app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST -H "Content-Type: application/json" -d '{"street":"1 S. Main","city":"Bloomington","state":"IL","zip":"61704"}' http://localhost:8080/zillow
 */
app.post( "/", function( request, response ){
	console.log( 'request', request.body );
	var address = request.body;
	var resp = dataGen.generate.zillowResponse(address);
  smdb.q.connection_live( function(err, result) {
    return responseHandler.get( response, err, resp );
  });
});
