var express     = require( "express" ),
    smdb        = require( "../db/sm-db" ),
    utils       = require( "../../../utils/utils" ),
    config      = require( "../../../config" ),
    request     = require( "request" ),
    publisher   = require( "../pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting streamline mortgage routes" );


app.get( "/live", function(request, response, next) {
  smdb.q.connection_live( function(err, result) {
    setTimeout( function() {

      return responseHandler.get( response, err, result );
    }, 10000);
  });
});

app.get( "/mortgages", function(request, response, next) {
  smdb.q.mortgages( function(err, result) {
      return responseHandler.get( response, err, { response: result[0].count } );
  });
});

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST http://localhost:8080/api/apply/mortgage
 */
app.post( "/apply/mortgage", function( req, res ){

  console.log( 'hello world', req.body);
  const application = JSON.parse( JSON.stringify( req.body ));
  const creditOptions = {
    url : config.services.credit.toString(),
    form: application.applicants[0]
  };
  const zillowOptions = {
    url : config.services.zillow.toString(),
    form: application.property
  };
  const decisionEngineOptions = {
    url : config.services.decisionEngine.toString() + "/apply/mortgage",
    form: null
  };


  /*
   * Retrieve the credit information for the primary applicant.
   */
  request.post( creditOptions, function(err, svcResponse, body) {
    let creditApplicant = JSON.parse( body );

    for( let key in creditApplicant ){
      if( application.applicants[0][key] === undefined ) {
        application.applicants[0][key] = creditApplicant[key];
      }
    }


    /*
     * Retrieve the zillow information for the property.
     */
    request.post( zillowOptions, function(err, svcResponse, body) {
      let zillowProperty = JSON.parse( body );

      for( let key in zillowProperty ){
        if( application.property[key] === undefined ) {
          application.property[key] = zillowProperty[key];
        }
      }

      decisionEngineOptions.form = application;


      /*
       * Retrieve the zillow information for the property.
       */
      request.post( decisionEngineOptions, function(err, svcResponse, body) {
        console.log( body );
        let decision = JSON.parse( body );

        smdb.q.addMortgageDecision( decision, function( err, resourceId ) {

          return responseHandler.post(request, res, err, resourceId);
        });
      });
    });
  });
});
