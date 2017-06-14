var pg     = require( "pg" ),
    config = require( "../../../config" );

console.log( "Connecting to PostgreSQL on: " + config.databaseURL );

/*
 * Creates a connection and terminates it once the callback has completed.
 */
exports.connect = function(callback) {
    exports.liveConnect( function(connection) {
        callback( connection );
        connection.on( "drain", connection.end.bind(connection) );
    });
};

/*
 * Creates a connection but does not terminate it. Caller is responsible for calling "connection.end()" on the connection parameter.
 */
exports.liveConnect = function(callback) {
    var connection = new pg.Client( config.databaseURL );

    connection.connect( function(err) {
        if ( err ) {
            return console.log( "unable to establish connection to PostgreSQL database | error message is: " + err );
        }

        try {
            callback( connection );
        }
        catch( e ) {
            console.error( e );
        }
    });
};

exports.rollback = function(connection) {
    connection.query( "ROLLBACK", function() {
        connection.end();
    });
};

