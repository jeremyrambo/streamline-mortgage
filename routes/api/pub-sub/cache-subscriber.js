var cache = require( "../cache" );
 

exports.subscribe = function( fayeClient ){

    fayeClient.subscribe( "/session", function( event ){
  		
  		console.log( "New session added, flushing session cache." );
  		
    	// got a new session, flush the session cache.
    	cache.flush( "sessions" );
    });
};
