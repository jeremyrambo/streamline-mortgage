var income      = require( './income' ),
    dbconnector = require( '../../../api/db/dbconnector' ),
    creditScore = require( './credit-score' );

module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {
    var income_lookup = {
        name  : "income_lookup",
        text  : "SELECT factor from sm_rules.income " +
                " WHERE min <= $1 " +
                "   AND max >= $2 " +
                " ORDER BY created_on DESC",
        values: [ application.applicants[0].income, application.applicants[0].income ]
    };
    connection.query( income_lookup, function(err, result) {
      console.log( 'income', err, result, income_lookup);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].factor );
    });
  });
};
