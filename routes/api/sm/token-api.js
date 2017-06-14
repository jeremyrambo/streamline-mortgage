var express     = require( "express" ),
    utils       = require( "../../../utils/utils" ),
    token_db  	= require( "../db/token-db" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting token routes" );


/*
 *
 */
app.get( "/user", function(request, response, next) {
	console.log( "GET /token/user" );

	var access_token = request.headers[ "access_token" ];
	var access_source = request.headers[ "access_source" ];

	if ( access_token === undefined || access_source === undefined ) { 
		return responseHandler.get( response, "You must pass headers \"access_token\" and \"access_source\" to retrieve a user token.", undefined );
	}

	token_db.by.application.verify( access_source, access_token, function( err, access ) {
		if( err || !access ) {
			return responseHandler.get( response, "The \"access_token\" and/or \"access_source\" does not have access to retrieve a user token.", undefined );
		}
		else {
			token_db.by.user.generate( access_source, access_token, function( err, result ) {

				return responseHandler.get( response, err, result ); 
			});
		}
	});
});