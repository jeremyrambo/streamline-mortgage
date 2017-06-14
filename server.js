var http        = require( "http" ),
    express     = require( "express" ),
    compression = require( "compression" ),
    morgan      = require( "morgan" ),
    config      = require( "./config" ),
    utils       = require( "./utils/utils" ),
    api         = require( "./routes/api" ),
    credit      = require( "./routes/services/credit" ),
    zillow      = require( "./routes/services/zillow" ),
    home        = require( "./routes/home" ),
    graph       = require( "./routes/graph" ),
    faye        = require( "faye" ),
    subscribers = require( "./routes/api/pub-sub/subscribers" );

var app = module.exports = express();

app.use( compression() );

/**
 * Mount the main static route for public content. This will provide the JavaScript
 * for the browser, CSS, HTML fragments, etc.
 */
console.log( "mounting static routes" );

app.use( utils.middleware.headerModifier );


app.use( express.static(__dirname + "/public", {
    maxAge : (config.production || config.minified) ? (60 * 60 * 1000) : (10 * 60 * 1000)
}));

app.use( morgan("combined") );

/**
 * Mount main REST routes.
 */
console.log( "mounting API routes" );
app.use( "/api", api );
app.use( config.services.credit.path, credit );
app.use( config.services.zillow.path, zillow );

/**
 * Mount default route.
 */
console.log( "mounting default route" );

app.get( "/", home );

app.get( "/graph", graph );

/**
 * Redirect all other requests to the index (HTML5 history).
 */
app.get( "*", home );

/**
 * Create server.
 */
var server = http.createServer( app ).listen( config.host.port );

if ( !server.address() ) {
    console.log( "\n\nERROR: Unable to start server, check to make sure port [" + config.host.port + "] is not in use by another process." );
}
else {
    console.log( "Listening on port " + server.address().port );
    console.log( "Running with configuration: " + JSON.stringify(config, undefined, 2) );
}


console.log( "Registering the publisher/subscriber server to route '/ps'." );
var bayeux = new faye.NodeAdapter( { mount: "/ps", timeout: 10 } );
bayeux.attach( server );
subscribers.mount();
