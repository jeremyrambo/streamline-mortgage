var cache           = require( "../cache"),
    token_db 	    = require( "../db/token-db" ),
    utils           = require( "../../../utils/utils" ),
    levenshtein     = require( "fast-levenshtein" );



var responseHandler = utils.responseHandler;

module.exports = function( request, response, next ) {

	// Riddles are stored in the POST/PUT body
	var riddleId  = request.body.rid;
	var riddleAn  = request.body.ran;

	// Access tokens are stored in the HTTP headers.
	var access_token = request.headers[ "access_token" ];
	var access_source = request.headers[ "access_source" ];
	var user_token = request.headers[ "user_token" ];

	if ( riddleId !== undefined && riddleAn !== undefined) {
		verifyRiddle( riddleId, riddleAn, function( correct ){
			if ( correct ) {
				next();
			}
			else {
				responseHandler.unauthorized( response, "Invalid answer to riddle question." );
			}
		});
	}

	else {
		token_db.by.user.verify( access_source, access_token, user_token, function( err, access ) {
			if ( !err && access ) {
				next();
			}
			else {
				responseHandler.unauthorized( response, "Invalid access credentials passed in." );
			}
		});
	}
};


function verifyRiddle( riddleId, riddleAn, callback ) {

	cache.match( "riddles", { "id" : riddleId }, function( riddle_arr ) {

		if ( riddle_arr === undefined || riddle_arr.length !== 1 ) {
			callback( false );
			return;
		}

		var answers = riddle_arr[0][ "answer" ].toLowerCase().split( "," );
		var lower_client_answer = riddleAn.toLowerCase();
		var match = false;
		for( var i=0; i < answers.length; i++ ){

			if ( answers[i] === lower_client_answer ) {
				callback( true );
				return;	
			}


			var distance = levenshtein.get( answers[ i ], lower_client_answer );

			// Match based on a factor of the distance. 
			if ( distance <= (answers[ i ].length - 3) ) {
				callback( true );
				return;
			}
		}
        callback( false );
	});
}