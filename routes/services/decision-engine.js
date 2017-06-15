var express     = require( "express" ),
	  compression = require( "compression" ),
	  bodyParser  = require( "body-parser" ),
    utils       = require( "../../utils/utils" ),
    config      = require( "../../config" ),
    request     = require( "request" ),
    publisher   = require( "../api/pub-sub/publisher" ),
    grade       = require( "./rules/grades" ),
		dataGen     = require( "../../utils/generateData");

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting underwriting service" );

app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST -H "Content-Type: application/json" -d '{"applicants":[{"firstName":"sue","lastName":"doe","ssn":"123456789"}],"property": {"address":{ "street":"1 S. Main","city":"Bloomington","state":"IL","zip":"61704"}}}' http://localhost:8080/decision-engine/apply/mortgage
 */
app.post( "/apply/mortgage", function( request, response ){
	console.log( 'request', request.params , request.body);

  var application = JSON.parse( JSON.stringify( request.body ));
  grade( application, function( err, result ) {
    if ( application.response === undefined ) {
      application.response = {};
    }
    console.log( result );

    application.response.grade = result.grade;
    return responseHandler.get( response, err, application );
  })
});
