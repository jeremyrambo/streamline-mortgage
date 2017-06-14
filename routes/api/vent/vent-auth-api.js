var express         = require( "express" ),
    vent_db         = require( "../db/vent-db" ),
    utils           = require( "../../../utils/utils" ),
    publisher       = require( "../pub-sub/publisher" ),
    auth_middleware = require( "../middleware/auth-middleware" );

var app = module.exports = express();

var responseHandler = utils.responseHandler;

console.log( "mounting authenticated vent routes" );

app.use( auth_middleware );



/*
 * When query contains "mode=create", this adds the parameter session name to the system if it doesn't already exist in the database
 * When no query, this will attempt to add a new message.
 * 
 * Usage: 
 * 		curl -X POST -H "Content-Type:application/json" -d '{"message":"message"}' http://localhost:5000/api/session/:session
 * 		curl -X POST -H "Content-Type:application/json" http://localhost:5000/api/session/:session?mode=create
 * 
 *      curl -X POST -H "Content-Type:application/json" 
 * 					 -H "user_token:c643b121-5605-4bfa-a59a-6fcd734d69b9"
 * 					 -H "access_source:native" 
 * 				     -H "access_token:2b579db0-ff29-4a46-bede-7800f1e3c7d7" 
 * 					 -d '{"session":"vent","riddle":{"wrong":false},"message":"here some self esteem, go forth and persecute me","moment":"Today at 9:41 PM"}' 
 * 					 http://localhost:8080/api/session/vent
 * 
 */
app.post( "/session/:session", function(request, response) {
	console.log( "Authenticated POST /session/:session" );
	var session = sessionName( request );
	var mode    = request.query.mode;
	var message   = request.body.message;
	var location  = "";
	var userAgent = utils.http.userAgent( request );

    vent_db.by.session.messages.add( session, message, userAgent, location, function(err, result) {
    	console.log( "results : " + JSON.stringify( result ));
    	if( !err ) {
	    	publisher.publish( "message", { "session" : session, "message" : message, "id" : result } );
    	}
        responseHandler.post( request, response, err, result );
    });
});


/*
 * When query contains "mode=create", this adds the parameter session name to the system if it doesn't already exist in the database
 * When no query, this will attempt to add a new message.
 * 
 * Usage: 
 * 		curl -X POST -H "Content-Type:application/json" -d '{"rid":120,"ran":"full","message":"simple curl test"}'  http://localhost:5000/api/session/:session/:id
 */
app.post( "/session/:session/:id", function(request, response) {
	console.log( "Authenticated POST /session/:session/:id" );
	var session = sessionName( request );

	var message   = request.body.message;
	var parent_id = request.params.id;
	var location  = "";
	var userAgent = utils.http.userAgent( request );

    vent_db.by.session.messages.reply( session, message, userAgent, location, parent_id, function(err, result) {
    	if( !err ) {
	    	publisher.publish( "message", { "session" : session, "message" : message, "id" : result } );
    	}
        responseHandler.post( request, response, err, result );
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
