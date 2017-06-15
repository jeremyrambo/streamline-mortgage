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
  },

  getMortgageDecision : function(decisionId,  callback ) {
    
		dbconnector.connect( function(connection) {
      var mortgage_retrieval = {
          name  : "recent_messages_query",
          text  : "SELECT resource from sm.mortgage " +
                  " WHERE id=$1",
          values: [decisionId]
      };
      connection.query( mortgage_retrieval, function(err, result) {
          callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
      });
    });
  },

  addMortgageDecision : function(mortgageDecision,  callback ) {

    // TODO: It would be nice to qualify the decision against a JSON schema.
		dbconnector.connect( function(connection) {
      var mortgage_decision = {
          name  : "mortgage_decision",
          text  : " INSERT INTO sm.mortgage (resource)" +
	             		" VALUES ($1)" +
                  " RETURNING id",
          values: [ mortgageDecision ]
      };

      connection.query( mortgage_decision, function(err, result) {
          callback( err, err || result.rowCount === 0 ? undefined : result.rows[0].id );
      });
		});

  },

}
