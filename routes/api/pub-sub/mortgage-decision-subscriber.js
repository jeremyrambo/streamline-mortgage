var apiEventDb    = require( "../db/api-events-db.js" ),
    smdb          = require( "../db/sm-db" );

exports.subscribe = function( fayeClient ){

    fayeClient.subscribe( "/api-event", function( event ){
        if( event.path === "/apply/mortgage" && event.method === "POST" ) {
          console.log( 'yeah, an event: ',  event);
          const mortgageEvent = JSON.parse( JSON.stringify(event) );
          smdb.q.getMortgageDecision( event.response.id, function( err, resource ){
            if( err ) {
              console.log( "An error occured during event processing:", err );
            }
            mortgageEvent.response = resource;
            apiEventDb.logEvent( mortgageEvent, function( err, eventId ) {
              console.log( "event logged", err, eventId );
            });
          });
        }
    });
};
