var fs 		= require( "fs" ),
    request = require( "request" ),
	config  = require( "./config" );


var apiRequest = request.defaults( {
	"baseUrl" : config.base_url
});

var authRequest = request.defaults( {
	"baseUrl" : config.base_url,

	"headers" : {
		"access_source" : config.test_app_source,
		"access_token"  : config.test_app_token
	}
});

// Get the top sessions.
for ( var i=0; i < 100; i++ ){
	apiRequest( {
			"uri" : "/session",

			qs : {
				"mode" : "top"
			}

		}, function( error, response, body ){
			if ( error ) {
				console.log( "error: " + error );
				return;
			}
			console.log( "Status code: " + response.statusCode );
		});
}


var s = Math.floor( Math.random() * config.sessions.length );
	

console.log( "URI:  " + "/session/" + config.sessions[s]);
// Create the mobydick session
apiRequest( {
		"uri"     : "/session/" + config.sessions[s],
		"method"  : "POST",

		"qs"      : {
			"mode" : "create"
		},
		"form"    : {}

	}, 
	function( error, response, body ){
		if ( error ) {
			console.log( "error: " + error );
			return;
		}
		console.log( "Status code: " + response.statusCode );


		// Get the User token 

		fs.readFile( "./content/moby-dick.txt", "utf8", function( err, test_content ){

			authRequest( {
					"uri" : "/token/user"
				}, 

				function( error, response, body ){
					var userToken = JSON.parse( body );

					var userRequest = authRequest.defaults( {
						"headers" : {
							"access_source" : config.test_app_source,
							"access_token"  : config.test_app_token,
							"user_token"    : userToken.token
						}
					});

					for ( var i=0; i < 100; i++ ){
						var message = extractMessage( test_content );

						// Post a message
						userRequest( {
								"uri"     : "/session/" + config.sessions[s],
								"method"  : "POST",

								"form"    : { 
									"message" : message
								}

							}, 
							function( error, response, body ){
								if ( error ) {
									console.log( "error: " + error );
									return;
								}
								console.log( "Creating a message Status code: " + response.statusCode );
								
								var parent_id = JSON.parse( body );

								// Reply to the message.
								for ( var j=0; j < 100; j++ ){
									userRequest( {
											"uri"     : "/session/" + config.sessions[s] + "/" + parent_id.id ,
											"method"  : "POST",

											"form"    : { 
												"message" : extractMessage( test_content )
											}

										}, function( error, response, body ){
											if ( error ) {
												console.log( "error: " + error );
												return;
											}
											console.log( "Status code: " + response.statusCode );
										});
								}
							});
					}
				});
		});
	});

function extractMessage( content ) {
	var content_length = content.length;
	var start = Math.floor((Math.random() * content_length ) - 1000  );
	var end   = Math.floor((Math.random() * 600 ) + start );

	console.log( "start: " + start + "  end: " + end + "  diff: " + (end-start));

	return content.substring( start, end );
};