var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.by = {

	application : {

		verify : function( source, access_token, callback ){

			dbconnector.connect( function(connection) {
		        var verify_access_query = {
		            name  : "verify_access_query",
		            text  : "SELECT true AS access " +
		            		"  FROM ventauth.app_token " +
		            		" WHERE source = $1 " +
		            		"   AND token = $2",
		            values: [ source, access_token ]
		        };
		        connection.query( verify_access_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0].access );
		        });
			});
		}
	},

	user : {

		generate : function( source, access_token, callback ) {

			dbconnector.connect( function(connection) {
		        var generate_user_token_query = {
		            name  : "generate_user_token_query",
		            text  : "INSERT INTO ventauth.user_token ( app_source, app_token )" +
		            		" VALUES ( $1, $2 ) " + 
		            		" RETURNING token",
		            values: [ source, access_token ]
		        };
		        connection.query( generate_user_token_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
		        });
			});
		}, 

		verify : function( source, access_token, user_token, callback ) {

			dbconnector.connect( function(connection) {
		        var verify_user_access_query = {
		            name  : "verify_user_access_query",
		            text  : "SELECT true AS access " +
		            		"  FROM ventauth.user_token " +
		            		" WHERE app_source = $1 " +
		            		"   AND app_token = $2" +
		            		"   AND token = $3",
		            values: [ source, access_token, user_token ]
		        };
		        connection.query( verify_user_access_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
		        });
			});
		}
	}
};