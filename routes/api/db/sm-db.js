var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.q = {

	connection_live : function( callback ){

		dbconnector.connect( function(connection) {
	        var connection_live = {
	            name  : "recent_messages_query",
	            text  : "SELECT 1 as live"
	        };
	        connection.query( connection_live, function(err, result) {
	            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
	        });
		});

	},

  mortgages : function( callback ) {

		dbconnector.connect( function(connection) {
	        var mortgage_count = {
	            name  : "recent_messages_query",
	            text  : "SELECT count(id) from sm.mortgage"
	        };
	        connection.query( mortgage_count, function(err, result) {
	            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
	        });
		});

  }
}
