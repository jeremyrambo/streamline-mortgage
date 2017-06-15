var dbconnector = require( '../../../api/db/dbconnector' );

module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {
    var ratio = application.applicants[0].income / (application.loan.purchasePrice - application.loan.downPayment);

    var income_to_loan_ratio = {
        name  : "income_to_loan_ratio",
        text  : "SELECT multiplier from sm_rules.income_to_loan_ratio " +
                " WHERE min <= $1 " +
                "   AND max >= $2 " +
                " ORDER BY created_on DESC",
        values: [ ratio, ratio ]
    };
    connection.query( income_to_loan_ratio, function(err, result) {
      console.log( 'income_to_loan_ratio', err, result, income_to_loan_ratio);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].multiplier );
    });
  });
};
