var faye    = require( "faye" ),
    config  = require( "../../../config" );

var fayeClient = new faye.Client( config.notifier.toString() );
fayeClient.connect();


exports.publish = function( eventType, messageObj, onSuccess, onFailure ){
    // Publication Client!
    var publication = fayeClient.publish( "/" + eventType, (messageObj ? messageObj : {}) );

    publication.then(function() {
        console.info("Message successfully published.");
        if( onSuccess ) { onSuccess(); }
    }, function(error) {
        console.error("Unable to publish event: " + JSON.stringify(error));
        if( onFailure ) { onFailure(error); }
    });
};