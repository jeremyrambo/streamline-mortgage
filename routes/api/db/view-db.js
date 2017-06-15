var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.q = {

  getProfits : function(callback) {
    dbconnector.connect( function(connection) {
      var current_profits = {
          name  : "current_profits_query",
          text  : "SELECT * from sm_views.grade_to_stats ORDER BY created_on DESC LIMIT 7"
      };
      connection.query( current_profits, function(err, result) {
          callback( err, err || result.rowCount === 0 ? undefined : result.rows);
      });
    });
  }
};
