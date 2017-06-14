var express     = require( "express" ),
    vent_db     = require( "../db/vent-db" ),
    utils       = require( "../../../utils/utils" ),
    shame_regex = require( "../../../utils/shame-regex" ),
    config      = require( "../../../config" ),
    publisher   = require( "../pub-sub/publisher" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting vent routes" );


/**
 * This piece of middleware is responsible for "saving shame".  Basically it strips out explicit content from the
 * site in real time.
 */
app.use( function( request, response, next ) {

	next();

	function saveShame( object ) {
		for ( var property in object ) {
            if ( !object.hasOwnProperty(property) ) {
                continue;
            }

            if ( property === "session_name" ) {
            	continue;
            }

            var value = object[property];

            if ( value && value.replace ) {
	            object[property] = value.replace( shame_regex, function ($0) {
				    return (new Array($0.length + 1).join("-"));
				});

            }

            else if ( value !== null && typeof value === 'object') {
            	saveShame( value );
            }

        }
	}

	var json = response.json;
    response.json = function(status, body) {
        var object = arguments.length === 1 ? status : body;
        if ( Array.isArray(object) ) {
            for ( var item in object ) {
            	saveShame( object[item] );
            }
        }
        else {
        	saveShame( object );
        }

        json.apply( this, arguments );
    };
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
	    vent_db.by.session.top_sessions( function(err, result) {
	        return responseHandler.get( response, err, result );
	    });
	}
	else if ( mode === "recent-messages" ) {
		var page    = parsePage( request.query.page ? request.query.page : "1" );

		vent_db.by.global.recent_messages( page, function(err, result) {
			return responseHandler.get( response, err, result );
		});
	}
	else {
		next();
	}
});

/*
 * This route will retrieve the statistics for the parameter messages.
 *
 * Usage:
 *      curl -v -X GET http://localhost:5000/api/session/:session/stats?messages=1,2,3...
 */
app.get( "/session/:session/stats", function( request, response) {
	console.log( "GET /session/:session/stats" );
	var session = sessionName( request );
	var message_ids = request.query[ "messages" ] .split( "," );

	vent_db.by.session.messages.stats.query ( session, message_ids, function( err, result ) {
    	if ( err || result === undefined ) {
	        responseHandler.get( response, err );
	        return;
    	}

    	var stats = {};
    	var source_ip = utils.http.source_ip( request );

    	for ( var i=0; i < result.length; i++ ){
    		var dbstat = result[ i ];

    		var local_stat = stats[ dbstat.parent_id ];

    		if ( local_stat === undefined ) {
    			local_stat = {
    				"likes" : 0,
    				"is_user" : dbstat.source_ip === source_ip
    			};
    		}

    		// Increment/decrement the like status based on the stored condition.
    		local_stat.likes++;
    		stats[ dbstat.parent_id ] = local_stat;
    	}

        responseHandler.get( response, err, stats );
	});
});



/*
 * This route will retrieve all the reply messages for a given set of messages.  The replies will
 * however be limited to 3 per message.
 *
 * Sample Response:
 * 		{ "1" : {
 *			"msgs" : [
 *				{ "id": "67", "domain_name": "vent", "session_name": "vent",
 *			  	  "created_on": "2015-11-13T02:18:12.535Z", "message": "yo",
 *			  	  "location": "","agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.5 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.5" }
 *				],
 *          "replies" : 32
 *		}}
 *
 * Usage:
 *      curl -v -X GET http://localhost:5000/api/session/:session/replies?messages=1,2,3...
 */
app.get( "/session/:session/replies", function( request, response ) {
	console.log( "GET /session/:session/replies" );
	var session = sessionName( request );
	var message_ids = request.query[ "messages" ] .split( "," );

	vent_db.by.session.messages.repliesIn ( session, message_ids, function( err, result ) {
    	if ( err || result === undefined ) {
	        responseHandler.get( response, err );
	        return;
    	}

    	var replies = {};

    	for ( var i=0; i < result.length; i++ ){
    		var dbstat = result[ i ];

    		var local_replies = replies[ dbstat.parent_id ];

    		if ( local_replies === undefined ) {
    			local_replies = {
    				"replies" : 0,
    				"msgs" : []
    			};
    		}

    		// Increment/decrement the like status based on the stored condition.
    		local_replies.replies++;
    		if ( local_replies.replies < 4 ){
	    		local_replies.msgs.push( dbstat );
    		}
    		replies[ dbstat.parent_id ] = local_replies;
    	}

        responseHandler.get( response, err, replies );
	});
});

/*
 * This route will like an individual message for a given session.  While the session is not
 * technically required for liking a message by id, we keep it on the route to follow RESTful patterns
 * add verify that it actually matches in the DB layer.
 *
 * Usage:
 * 		curl -v -X PUT http://localhost:5000/api/session/:session/:id/like
 */
app.put( "/session/:session/:id/like", function( request, response) {
	console.log( "PUT /session/:session/:id/like" );
	var session = sessionName( request );
	var source_ip  = utils.http.source_ip( request );
	var userAgent = utils.http.userAgent( request );

	vent_db.by.session.messages.stats.like( session, request.params.id, userAgent, source_ip, function(err, result) {
		if ( err || result === undefined ) {
	        responseHandler.put( response, err );
	        return;
    	}
    	responseHandler.put( response, err );
	});
});

/*
 * This route will all the reply messages for a given session message.
 *
 * Usage:
 * 		curl -v -X GET http://localhost:5000/api/session/:session/:id/replies
 */
app.get( "/session/:session/:id/replies", function( request, response) {
	console.log( "GET /session/:session/:id/replies" );
	var session = sessionName( request );

	vent_db.by.session.messages.replies( session, request.params.id, function(err, result) {
		if ( err || result === undefined ) {
	        responseHandler.get( response, err, result );
	        return;
    	}
    	responseHandler.get( response, err, result );
	});
});


/*
 * This route will retrieve an individual message for a given session.  While the session is not
 * technically required for getting a message by id, we keep it on the route to follow RESTful patterns
 * add verify that it actually matches in the DB layer.
 *
 * Usage:
 * 		curl -v -X GET http://localhost:5000/api/session/:session/:id
 */
app.get( "/session/:session/:id", function( request, response) {
	console.log( "GET /session/:session/:id" );
	var session = sessionName( request );
	vent_db.by.session.messages.get( session, request.params.id, function(err, result) {
		if ( err || result === undefined ) {
	        responseHandler.get( response, err, result );
	        return;
    	}
    	responseHandler.get( response, err, result );
	});
});

/*
 * When query contains "mode=create", this adds the parameter session name to the system if it doesn't already exist in the database
 * When no query, this will attempt to add a new message.
 *
 * Usage:
 * 		curl -X POST -H "Content-Type:application/json" -d '{"message":"message"}' http://localhost:5000/api/session/:session
 * 		curl -X POST -H "Content-Type:application/json" http://localhost:5000/api/session/:session?mode=create
 */
app.post( "/session/:session", function(request, response, next) {
	console.log( "POST /session/:session" );
	var session = sessionName( request );
	var mode    = request.query.mode;

	if( mode ===  "create" ) {

		vent_db.add.session( session, "", function(err, sessionName) {
			publisher.publish( "session", { "session" : sessionName } );
			responseHandler.post( request, response, err, sessionName );
		});
	}
	else {
		next();
    }
});




/*
 * When query contains "mode=exists", this will determine if the session exists.
 * When query contains "page=#" (where # is an integer), this will return the next "page" of messages.
 * When no query, this will simply return the first page of messages.
 *
 * Usage:
 * 		curl -v -X GET http://localhost:5000/api/session/:session
 * 		curl -v -X GET http://localhost:5000/api/session/:session?page=1
 * 		curl -v -X GET http://localhost:5000/api/session/:session?mode=exists
 */
app.get( "/session/:session", function(request, response) {
	console.log( "GET /session/:session" );
	var session = sessionName( request );
	var mode    = request.query.mode;

	if( mode ===  "exists" ) {
	    vent_db.by.session.exists( session, function(err, result) {
	        responseHandler.get( response, err, result );
	    });
	}
	else {
		var page = parsePage( request.query.page ? request.query.page : "1" );

	    vent_db.by.session.messages.query( session, page, function(err, result) {
	    	if ( err || result === undefined ) {
		        responseHandler.get( response, err );
		        return;
	    	}

	    	var pageResult = {
	    		msgs : result
	    	};

	    	if ( result.length === vent_db.by.session.messages._message_limit ) {
	    		pageResult.next = (page + 1);
	    	}

	    	if ( page > 1 ) {
	    		pageResult.prev = (page - 1);
	    	}

	        responseHandler.get( response, err, pageResult );
	    });
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


function sessionName( request ){
	var session = request.params.session;

	if ( session ) {
		return session.toLowerCase();
	}
	return undefined;
}

function parsePage( page ){
	var n_page = page.match(/\d+$/);
	return parseInt(n_page, 10);
}
