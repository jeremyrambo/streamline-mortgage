var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.log_api = function( request_path, userAgent, source_ip ){

	dbconnector.connect( function(connection) {
        var log_api_query = {
            name  : "log-api-metric",
            text  : "INSERT INTO sm_metric.api_log ( request_path, source_ip, agent) " +
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
