var Twitter   = require( "twitter" ),
    config    = require( "../../../config" ),
    cron_job  = require( "cron" ).CronJob,
    vent_db   = require( "../db/vent-db" );
 
var twtterClient = new Twitter({
  consumer_key: "Odh6cWP053iJgiBeOVjZT1x2p",
  consumer_secret: "7ruiaNJkCntI1LjoUxXAOcIhdtotCPusv7iqo0SvHb2L8Bxygc",
  access_token_key: "3832236374-z1VZ2cnPrlRssniGrnZVHmkIg1t3Z3ynphk7L8z",
  access_token_secret: "kiAkbUDSbtKsDlYfaHQTNLQLtgiKJtovni0JEJAB3Z2ml"
});
 

exports.subscribe = function( fayeClient ){
    
    if ( config.pubsub.twitter ) {
      
      fayeClient.subscribe( "/message", function( event ){
        
        enforceLimiter( event, function() {

          generateTweet( event, function( status_obj ) {

            twtterClient.post("statuses/update", status_obj, function(error, tweet, response){
              if( error ) {
                console.log( JSON.stringify( error ) );
                return;
              }
            });
          });
        });
      });
    }
    
    else {
      console.log( "Bypassing Twitter, mode is not 'production'.  Set environment variable DISABLE_TWITTER to 'false' or delete to enable.  Tweets will be logged to console only." );
  
      fayeClient.subscribe( "/message", function( event ){


        enforceLimiter( event, function() {
          generateTweet( event, function( status_obj ) {
            console.log( "Event: " + JSON.stringify( event, undefined, 2) + "\n" +
                         "Tweet: " + JSON.stringify( status_obj, undefined, 2) +  "\n" +
                         "Length: " + status_obj.status.length );
          });
        });
      });
    }

};


function generateTweet( event, callback ) {

  vent_db.by.session.info( event.session, function(err, session_info){

    var twitter_handle = session_info.twitter_handle;

    // If there is no registered twitter handle, simply attempt to use the 
    // event session name via a hashtag.  A future option would be to lookup 
    // to see if the event session name exists as a handle in twitter as their 
    // REST api supports these kidns of lookups.
    if ( twitter_handle === undefined || twitter_handle === null || twitter_handle.length === 0 ){
      twitter_handle = "#" + event.session;
    }
    else {
      twitter_handle = "@" + twitter_handle;
    }

    var ref_url = event.id ? ( " - " + config.host.toString() + "/" + event.session + "/" + event.id ) : "";
    var tweet_len = 140 - (ref_url.length - ( ref_url.length === 0 ? 0 : 1 ));
    var status = twitter_handle; 
    var message_words = event.message.split( " " );

    for ( var i=0; i < message_words.length; i++ ) {
      if ( ( status.length + ref_url.length + message_words[i].length ) > 140 ) {
        break;
      }

      status += " " + message_words[i];
    }

    status += ref_url;

    callback( { "status" : status } );

  });
};

var _session_limiter = {}

function enforceLimiter( event, callback ){

  if ( _session_limiter[ event.session ] ){
    return;
  }
  else {
    _session_limiter[ event.session ] = true;

    callback();
  }
}

new cron_job(
    {
      cronTime: "0 0,10,20,30,40,50 * * * *",
      onTick: function() {
        console.log( "flushing session limiter: " + JSON.stringify(_session_limiter, undefined, 2) );
        _session_limiter = {};
      },
      timeZone: "America/Chicago"
    }
).start();