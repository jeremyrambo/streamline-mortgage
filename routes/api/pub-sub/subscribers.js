var faye                        = require( "faye"),
    mortgageDecisionSubscriber  = require( "./mortgage-decision-subscriber" ),
    config                      = require( "../../../config" );


exports.mount = function() {

    console.log( "Mounting subscribers on URL: " + config.notifier.toString() );

    var fayeClient = new faye.Client( config.notifier.toString() );
    fayeClient.connect();

    mortgageDecisionSubscriber.subscribe( fayeClient );
};
