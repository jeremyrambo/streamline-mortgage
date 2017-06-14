var express = require( "express" ),
    CacheControl = require( "express-cache-control" ),
    CronJob = require( "cron" ).CronJob;

var domain = require( "../db/domain" ),
    utils = require( "../../../utils/utils" );


/* Local cache for the domain api.  A cron will flush this 1 every 10 days. */
var _localcache = {};
new CronJob(
    {
      cronTime: "0 0 0 1/10 * *",
      onTick: function() {
        // Runs 1 time every ten days.
        _localcache = {};
      },
      start: false,
      timeZone: "America/Chicago"
    }
).start();



var app = module.exports = express();
var responseHandler = utils.responseHandler;
var cache = new CacheControl().middleware;

console.log( "mounting timezone domain route" );

app.use( cache("days", 10) );

app.get( "/timezone", function(request, response) {

    if ( _localcache.timezones ){
        return responseHandler.get( response, undefined, _localcache.timezones );
    }

    domain.timezones( function( err, result ){
        if( result ){
            _localcache.timezones = result;
        }
        return responseHandler.get( response, err, result );
    });
});