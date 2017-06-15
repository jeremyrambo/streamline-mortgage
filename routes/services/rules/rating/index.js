var dbconnector = require( '../../../api/db/dbconnector' ),
    baseRate    = require( './base-rate' ),
    income2Loan = require( './income-to-loan' ),
    gradeMulti  = require( './grade-multiplier' ),
    yearBuilt   = require( './year-built' );

module.exports = function( application, callback ) {

  var rate = parseFloat(0);
  baseRate.factor( application, function( f ) {
    rate += parseFloat(f);

    income2Loan.factor( application, function( f ) {
      rate += parseFloat(f);

      gradeMulti.factor( application, function( f ) {
        rate += parseFloat(f);

        yearBuilt.factor( application, function( f ) {
          rate += parseFloat(f);
          callback( null, rate );
        });
      });
    });
  });
};
