var express     = require( "express" ),
	  compression = require( "compression" ),
	  bodyParser  = require( "body-parser" ),
    utils       = require( "../../utils/utils" ),
    config      = require( "../../config" ),
    request     = require( "request" ),
    publisher   = require( "../api/pub-sub/publisher" ),
    grade       = require( "./rules/grades" ),
    rate        = require( "./rules/rating" ),
    dbconnector = require( '../api/db/dbconnector' ),
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

    console.log( 'grade:', result );

    application.response.grade = result.grade;

		rate( application, function( err, result ) {

	    console.log( 'rate:', err, result );
	    application.response.rate = result;
	    return responseHandler.get( response, err, application );
		});
  })
});

app.post( "/rules/rating/grade_multiplier", function( request, response ){
	dbconnector.connect( function(connection) {
		var update_grade_multiplier = {
				name  : "update_grade_multiplier",
				text  : "INSERT INTO sm_rules.grade_multiplier (grade, multiplier ) " +
								"VALUES ($1, $2)",
				values:[ request.body.grade, request.body.multiplier ]
		};
		connection.query( update_grade_multiplier, function(err, result) {
			if( err ) {
				return console.log( err );
			}
			return responseHandler.post( request, response, err, 1 );
		});
	});
});

app.get( "/rules/rating/grade_multiplier/:grade", function( request, response ){
	console.log( 'made it here', request.params)
	dbconnector.connect( function(connection) {
		var update_grade_multiplier = {
				name  : "update_grade_multiplier",
				text  : "SELECT * FROM sm_rules.grade_multiplier " +
								" WHERE grade=$1 " +
								" ORDER BY created_on DESC",

				values:[ request.params.grade ]
		};
		connection.query( update_grade_multiplier, function(err, result) {
			if( err ) {
				return console.log( err );
			}
			return responseHandler.get( response, err, result.rows );
		});
	});
});
