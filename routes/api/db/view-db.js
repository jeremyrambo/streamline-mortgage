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
  },
  getLogs : function(callback) {
    dbconnector.connect( function(connection) {
      var logs = {
          name  : "logs_query",
          text  : "SELECT log_data from sm_views.machine_adjustment_log ORDER BY created_on DESC LIMIT 5"
      };
      connection.query( logs, function(err, result) {
          callback( err, err || result.rowCount === 0 ? undefined : result.rows);
      });
    });
  }
};
