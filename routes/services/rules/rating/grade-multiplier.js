var dbconnector = require( '../../../api/db/dbconnector' );

module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {

    var grade_multiplier = {
        name  : "grade_multiplier",
        text  : "SELECT multiplier from sm_rules.grade_multiplier " +
                " WHERE grade = $1 " +
                " ORDER BY created_on DESC",
        values: [ application.response.grade ]
    };
    connection.query( grade_multiplier, function(err, result) {
      console.log( 'grade_multiplier', err, result, grade_multiplier);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].multiplier );
    });
  });
};
