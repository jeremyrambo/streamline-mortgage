var express     = require( "express" ),
    smdb        = require( "../db/sm-db" ),
    utils       = require( "../../../utils/utils" ),
    shame_regex = require( "../../../utils/shame-regex" ),
    config      = require( "../../../config" ),
    publisher   = require( "../pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting vent routes" );


app.get( "/live", function(request, response, next) {
  smdb.q.connection_live( function(err, result) {
    setTimeout( function() {

      return responseHandler.get( response, err, result );
    }, 10000);
  });
});

app.get( "/mortgages", function(request, response, next) {
  smdb.q.mortgages( function(err, result) {
      return responseHandler.get( response, err, { response: result[0].count } );
  });
});
/*
 * When query contains "mode=top", this will return the top 15 sessions.
 * When query contains "mode=riddle", this will return a random riddle (optional parameter of "avoid=#" will ensure a certain riddle is avoided).
 * When query contains "mode=recent-messages", this will return a random riddle (optional parameter of "page=#" will retrieve the next set of messages).
 * When query contains "mode=query", this will query all session to match the required parameter of "q".
 * When no query, this will simply return a 404.
 *
 * Usage:
 * 		curl -v -X GET http://localhost:5000/api/session?mode=top
 * 		curl -v -X GET http://localhost:5000/api/session?mode=riddle&avoid={2}
 * 		curl -v -X GET http://localhost:5000/api/session?mode=recent-messages&page={2}
 * 		curl -v -X GET http://localhost:5000/api/session?mode=query&q={2}
 */
app.get( "/session", function(request, response, next) {
	console.log( "GET /session" );
	var mode = request.query.mode;

	if( mode ===  "top" ) {
	    smdb.by.session.top_sessions( function(err, result) {
	        return responseHandler.get( response, err, result );
	    });
	}
	else if ( mode === "recent-messages" ) {
		var page    = parsePage( request.query.page ? request.query.page : "1" );

		smdb.by.global.recent_messages( page, function(err, result) {
			return responseHandler.get( response, err, result );
		});
	}
	else {
		next();
	}
});

/*
 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
 *
 * Usage: curl -v -X POST http://localhost:5000/api/domain
 */
app.post( "/domain", function( request, response ){

	vent_db.add.domain( function(err, domainName) {
		responseHandler.post( request, response, err, domainName );
	});
});
