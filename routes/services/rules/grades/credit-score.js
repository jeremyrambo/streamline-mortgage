
var income      = require( './income' ),
    dbconnector = require( '../../../api/db/dbconnector' ),
    creditScore = require( './credit-score' );

module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {
    var credit_score_lookup = {
        name  : "credit_score_lookup",
        text  : "SELECT factor from sm_rules.credit_score " +
                " WHERE min <= $1 " +
                "   AND max >= $2 " +
                " ORDER BY created_on DESC",
        values: [ application.applicants[0].creditScore, application.applicants[0].creditScore ]
    };
    connection.query( credit_score_lookup, function(err, result) {
      console.log( 'credit score', err, result, credit_score_lookup);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].factor );
    });
  });
};
