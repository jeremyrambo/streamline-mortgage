var config          = require( "../../../config" ),
    request         = require( "request" ),
    dbconnector     = require( "../../../routes/api/db/dbconnector" );


module.exports = {

  gather : function() {
    dbconnector.connect( function(connection) {
      var connection_live = {
          name  : "recent_messages_query",
          text  : "SELECT * FROM sm.api_events " +
                  " WHERE method='POST' " +
                  "   AND path='/apply/mortgage'" +
                  " ORDER BY created_on DESC " +
                  " LIMIT 10000"
      };

      var compute = {
        grades : {},
        rates : []
      }

      connection.query( connection_live, function(err, result) {
        for( var x=0; x < result.rows.length; x++ ) {
          var response = JSON.parse( result.rows[x].response );
          // console.log( 'response: ', response);
          var application = JSON.parse( response.resource );
          // console.log( 'application', application );

          // console.log( 'response: ', response);
          // console.log( 'parsed: ', JSON.parse( response ));
          // console.log( 'application', JSON.parse( JSON.parse( response ).resource ));

          var grades = compute.grades[application.response.grade];
          if( grades === undefined ) {
            compute.grades[application.response.grade] = [];
          }

          var grade  = {
            amount : (application.loan.purchasePrice - application.loan.downPayment),
            rate : application.response.rate,
            annualProfit : ((application.loan.purchasePrice - application.loan.downPayment) * (application.response.rate / 100))
          }

          compute.grades[application.response.grade].push( grade );
          compute.rates.push( application.response.rate );
        }


        for( var grade in compute.grades ){
          var gradeSum = 0;
          var rateSum = parseFloat(0);
          var profit = parseFloat(0);
          for( var y=0; y<compute.grades[grade].length; y++ ) {
            var g = compute.grades[grade][y];
            gradeSum += g.amount;
            rateSum += g.rate;
            profit += g.annualProfit;
          }

          // console.log( 'Grade ', grade ) ;
          // console.log( '\t total: ', gradeSum );
          // console.log( '\t avg. rate:', rateSum / compute.grades[grade].length );
          // console.log( '\t profit:', profit );
          var data = {
            total : gradeSum,
            avgrate : (rateSum / compute.grades[grade].length ),
            profit : profit
          };
          logStats( grade, data );
        }
      });
    });
  }
};


function logStats( grade, data ) {
  dbconnector.connect( function(connection) {
    var grade_to_stats = {
        name  : "recent_messages_query",
        text  : "INSERT INTO sm_views.grade_to_stats (grade, data ) " +
                "VALUES ($1, $2)",
        values:[ grade, data ]
    };
    connection.query( grade_to_stats, function(err, result) {
      if( err ) {
        return console.log( err );
      }
    });
  });
}
