var fs     = require( "fs" ),
    moment = require( "moment" ),
    config = require( "../config" );

function logError( err ) {
    if ( err ) {
        console.log( err.toString() );
    }
}

exports.middleware = {

    headerModifier : function(request, response, next) {
        response.setHeader( "Last-Modified", moment.utc().format() );

        next();
    }
};

exports.responseHandler = {

    implicit : function ( request, response, err, xtra) {
        console.log( "Handling response implicitly for request: %s %s", request.method, request.originalUrl );
        switch( request.method ){
            case "put":
            case "PUT":
                exports.responseHandler.put( response, err );
                break;
            case "post":
            case "POST":
                exports.responseHandler.post( request, response, err, xtra );
                break;
            case "get":
            case "GET":
                exports.responseHandler.get( response, err, xtra );
                break;
            case "delete":
            case "DELETE":
                exports.responseHandler.delete( response, err );    
                break;
            default:
                console.log( "Unable to handle response implicitly for request: %s %s", request.method, request.originalUrl );
                break;
        }
    },

    get : function(response, err, result) {
        logError( err );
        if ( err ) {
            response.status( 500 ).json( { "error": err.toString() } );
        }
        else if ( result === undefined ) {
            response.sendStatus( 404 );
        }
        else {
            response.json( result );
        }
    },

    post : function(request, response, err, resourceId) {
        logError( err );
        if ( err ) {
            response.status( 500 ).json( { "error": err.toString() } );
            return;
        }

        if ( isNaN( resourceId ) ){
            response.set( "Location", request.originalUrl + "/" + resourceId );
            response.status( 201 ).json( {"id" : resourceId } );
        }
        else {
            var numericResourceId = parseInt( resourceId );
            response.set( "Location", request.originalUrl + "/" + numericResourceId );
            response.status( 201 ).json( {"id" : numericResourceId } );
        }
    },

    put : function(response, err) {
        // If the error returned is 1062 (MySQL error code for duplicate primary key), ignore it as PUT operations are idempotent
        if ( err && err.errno === 1062 ) {
            err = undefined;
        }

        logError( err );
        response.status( err ? 500 : 204 ).send( err ? {"error" : err.toString()} : "" );
    },

    delete : function(response, err) {
        logError( err );
        response.status( err ? 500 : 204 ).send( err ? {"error" : err.toString()} : "" );
    },

    unauthorized : function(response, err) {
        logError( err === undefined ? "Unauthorized Access to requested resource" : err );
        response.sendStatus( 401 );
        response.end();
    }
};

exports.sendFile = function(response, filePath, contentType) {
    fs.exists( filePath, function(exists) {
        if ( !exists ) {
            response.send( 404 );
            return;
        }

        var fileSize = fs.statSync( filePath ).size;

        response.type( contentType === undefined ? "html" : contentType );
        response.set( "Content-Length", fileSize );

        fs.createReadStream( filePath ).pipe( response );
    });
};


exports.session = {

    normalize : function( sessionName ) {
        return sessionName.toLowerCase().replace( " ", "" );
    }
}

exports.http = {

    userAgent : function( request ){
        return request.headers["user-agent"];
    },

    getCookieValue : function( request, name ){
        return request.cookies[ name ];
    },

    clearCookies : function ( response ) {
        console.log( "there are no cookies to clear." );
    },

    source_ip : function( request ) {

        var retval = "";

        var headers = request[ "headers" ];

        if (headers && ( headers["x-forwarded-for"] || headers["X-Forwarded-For"] ) ) {
            // Proxied request
            retval = headers["x-forwarded-for"];

            if ( retval === undefined ) {
                retval = headers["X-Forwarded-For"];
            }

        } 
        else {
            if ( config.env = "localhost" ) {
                // TODO: Perhaps have a set of JS files served when running locally to "proxy" functions
                //       rather than have "test" code in the production code.
                return "127.0.0." + (Math.floor(Math.random() * 2) + 1);
            }
        }

        return retval;

    }

};

