var dbconnector = require( '../../../api/db/dbconnector' );


module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {
    var base_rate = {
        name  : "base_rate",
        text  : "SELECT rate from sm_rules.base_rate " +
                " ORDER BY created_on DESC"
    };
    connection.query( base_rate, function(err, result) {
      console.log( 'base_rate', err, result, base_rate);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].rate );
    });
  });
};
