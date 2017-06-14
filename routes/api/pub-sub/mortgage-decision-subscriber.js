var apiEventDb    = require( "../db/api-events-db.js" );

exports.subscribe = function( fayeClient ){

    fayeClient.subscribe( "/api-event", function( event ){
        if( event.path === "/mortgages" ) {
          console.log( 'yeah, an event: ',  event);
          apiEventDb.logEvent( event, function( err, eventId ) {
            console.log( "event logged", err, eventId );
          })
        }
    });
};
