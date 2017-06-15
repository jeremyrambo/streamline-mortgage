var express     = require( "express" ),
	  compression = require( "compression" ),
	  bodyParser  = require( "body-parser" ),
    smdb        = require( "../api/db/sm-db" ),
    utils       = require( "../../utils/utils" ),
    config      = require( "../../config" ),
    request     = require( "request" ),
    publisher   = require( "../api/pub-sub/publisher" ),
		dataGen     = require( "../../utils/generateData");

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting credit service" );

app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST -H "Content-Type: application/json" -d '{"firstName":"sue","lastName":"doe","ssn":"123456789","address":{ "street":"1 S. Main","city":"Bloomington","state":"IL","zip":"61704"}}' http://localhost:8080/credit
 */
app.post( "/", function( request, response ){
	console.log( 'request', request.params , request.body);
	var creditScore = dataGen.generate.creditScore();
	var applicant = request.body;
	applicant.creditScore = creditScore;
  return responseHandler.get( response, err, applicant );
});
