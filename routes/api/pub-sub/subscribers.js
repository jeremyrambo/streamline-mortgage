var faye     = require( "faye"),
    config   = require( "../../../config" );


exports.mount = function() {

    console.log( "Mounting subscribers on URL: " + config.notifier.toString() );

    var fayeClient = new faye.Client( config.notifier.toString() );
    fayeClient.connect();

    // cache.subscribe( fayeClient );
};
