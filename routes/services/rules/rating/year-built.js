var dbconnector = require( '../../../api/db/dbconnector' );

module.exports.factor = function( application, callback ) {

  /*
   * Lookup the factor based on the applicants credit score.
   */
	dbconnector.connect( function(connection) {

    var year_built = {
        name  : "year_built",
        text  : "SELECT multiplier from sm_rules.year_built " +
                " WHERE min <= $1 " +
                "   AND max >= $2 " +
                " ORDER BY created_on DESC",
        values: [ application.property.features.yearBuilt, application.property.features.yearBuilt ]
    };
    connection.query( year_built, function(err, result) {
      console.log( 'year_built', err, result, year_built);
      if( err ) {
        return callback( err );
      }
      return callback( err || result.rowCount === 0 ? 0 : result.rows[0].multiplier );
    });
  });
};
