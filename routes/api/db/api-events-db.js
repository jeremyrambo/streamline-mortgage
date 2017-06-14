var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

module.exports = {

	 logEvent : function( apiEvent, callback ){

		dbconnector.connect( function(connection) {
      var log_api_event = {
          name  : "recent_messages_query",
          text  : " INSERT INTO sm.api_events (path, method, response)" +
	             		" VALUES ($1, $2, $3)" +
                  " RETURNING id",
          values: [ apiEvent.path, apiEvent.method, apiEvent.response ]
      };
      connection.query( log_api_event, function(err, result) {
          callback( err, err || result.rowCount === 0 ? undefined : result.rows[0].id );
      });
		});

	},
}
