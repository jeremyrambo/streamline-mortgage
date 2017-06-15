var request     = require( "request" ),
    dbconnector = require( '../../../routes/api/db/dbconnector' );

module.exports = {

  adapt : {
    grade : function( grade ) {
      const gradeOptions = {
        url : "http://localhost:8080/decisionengine/rules/rating/grade_multiplier/" + grade,
      };

      request.get( gradeOptions, function(err, svcResponse, body) {
        if( err ){
          console.log( err);
        }
        console.log( body );

        calculateTrend( grade, function( multiplierShift ){
          console.log( 'shift', multiplierShift, JSON.parse(body)[0] );
          if( multiplierShift != 0 ){
            var newRate = parseFloat(JSON.parse(body)[0].multiplier) + multiplierShift;
            publishFactorChange( grade, newRate );
            logMachineAdjustment( "Adjusting '" + grade + "' grade by " + multiplierShift + "%");
            console.log( "setting new rate ", newRate );
          }
        });
      });
    }
  }
}

function calculateTrend( grade, callback ) {

  dbconnector.connect( function(connection) {
		var update_grade_multiplier = {
				name  : "update_grade_multiplier",
				text  : "SELECT * FROM sm_views.grade_to_stats" +
								" WHERE grade=$1 " +
								" ORDER BY created_on DESC",
				values:[ grade ]
		};
		connection.query( update_grade_multiplier, function(err, result) {
			if( err ) {
				return console.log( err );
			}
      var body = result.rows;

      console.log( 'computing profitability trend over time...');
      console.log( 'rows', JSON.parse(body[0].data), body[ body.length -1 ].data );
      var latestProfit = JSON.parse(body[0].data).profit;
      var earliestProfit = JSON.parse(body[ body.length -1 ].data).profit;

      var trend = latestProfit - earliestProfit;

      console.log( 'trend', latestProfit, earliestProfit, trend);
      if ( trend < 0 ) {
        console.log( "Profits decreasing, adjust rate based on grade...");
  			return callback( parseFloat( -0.05 ) );
      }
      else if ( trend > 1000000 ) {
        console.log( "Profits increasing too much, decreasing rate to keep customers happy...");
  			return callback( parseFloat( 0.05 ) );
      }
			return callback( 0 );
		});
	});

}

function publishFactorChange( grade, multiplier ) {
  const factorChangeOptions = {
    url : "http://localhost:8080/decisionengine/rules/rating/grade_multiplier",
    form: { grade: grade, multiplier: multiplier }
  };

  request.post( factorChangeOptions, function(err, svcResponse, body) {
    if( err ){
      console.log( err);
    }
    console.log( body );
  });
}

function logMachineAdjustment( message ) {
  console.log( message );
  dbconnector.connect( function(connection) {
    var log_machine_adjustment = {
        name  : "log_machine_adjustment",
        text  : "INSERT INTO sm_views.machine_adjustment_log ( log_data ) " +
                "VALUES ($1)",
        values:[ message ]
    };
    connection.query( log_machine_adjustment, function(err, result) {
      if( err ) {
        return console.log( err );
      }
    });
  });
}
