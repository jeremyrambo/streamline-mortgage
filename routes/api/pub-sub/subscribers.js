var faye     = require( "faye"),
    config   = require( "../../../config" ),
    twitter  = require( "./twitter-subscriber.js" ),
    cache    = require( "./cache-subscriber.js" );


exports.mount = function() {

    console.log( "Mounting subscribers on URL: " + config.notifier.toString() );

    var fayeClient = new faye.Client( config.notifier.toString() );
    fayeClient.connect();

    twitter.subscribe( fayeClient );
    cache.subscribe( fayeClient );
};