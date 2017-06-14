
exports.subscribe = function( fayeClient ){

    fayeClient.subscribe( "/mortgage-decision", function( event ){
        console.log( 'yeah, an event: ',  event );
    });
};
