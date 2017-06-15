var dataGen   = require( "../../../utils/generateData" ),
    suspend   = require( "suspend" ),
    request   = require( "request" );

module.exports = {

  fabricate : function(count) {
    var requests = [];
    for(var i = 0; i < count; i++) {
      requests[i] = {};
      requests[i].applicants = [dataGen.generate.applicant()];
      requests[i].property = dataGen.generate.property();
      requests[i].loan = dataGen.generate.loan();
    }
    return requests;
  },

  simulate : function( requestData ) {
    const driverOptions = {
      url : "http://localhost:8080/api/apply/mortgage",
      form: null
    };


    for( var x=0; x < requestData.length; x++ ) {
      /*
       * Retrieve the credit information for the primary applicant.
       */
     suspend(function* () {
        driverOptions.form = requestData[x];
        request.post( driverOptions, function(err, svcResponse, body) {
          if( err ){
            console.log( err);
            process.exit(1);
          }
          process.stdout.write("#");
        });
        yield setTimeout(suspend.resume(), 100); // 1 seconds pass..
      })();

    }
  }
}
