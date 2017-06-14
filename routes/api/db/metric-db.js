var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.log_api = function( request_path, userAgent, source_ip ){

	dbconnector.connect( function(connection) {
        var log_api_query = {
            name  : "log-api-metric",
            text  : "INSERT INTO ventmetric.api_log ( request_path, source_ip, agent) " +
            		" VALUES ( $1, $2, $3 )",
            values: [ request_path, source_ip, userAgent ]
        };

        connection.query( log_api_query, function(err, result) {
            if ( err ) {
            	console.log( "Error logging api metric!" );
            }
        });
	});
};

exports.log_home = function( userAgent, source_ip ){

	dbconnector.connect( function(connection) {
        var log_home_query = {
            name  : "log-home-metric",
            text  : "INSERT INTO ventmetric.home_log ( source_ip, agent) " +
            		" VALUES ( $1, $2 )",
            values: [ source_ip, userAgent ]
        };

        connection.query( log_home_query, function(err, result) {
            if ( err ) {
            	console.log( "Error logging home metric!" );
            }
        });
	});
};
