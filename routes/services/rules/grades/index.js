var income      = require( './income' ),
    dbconnector = require( '../../../api/db/dbconnector' ),
    creditScore = require( './credit-score' );

module.exports = function( application, callback ) {


  applyFactors( application, function( sum ){

    /*
     * We have aggregated the factors, now lookup the result in the grades table.
     */
  	dbconnector.connect( function(connection) {
      var grade_lookup = {
          name  : "grade_lookup",
          text  : "SELECT grade from sm_rules.grade " +
                  " WHERE factor=$1",
          values: [ sum ]
      };
      connection.query( grade_lookup, function(err, result) {
        if( err ) {
          return callback( err );
        }
        return callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
      });
    });

  });
};

function applyFactors( application, callback ) {
  var factor = 0;
  income.factor( application, function( f ) {
    factor += f;

    creditScore.factor( application, function( f ) {
      factor += f;
      callback( factor );
    });
  });
}
