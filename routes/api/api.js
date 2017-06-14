var express        = require( "express" ),
	compression    = require( "compression" ),
	bodyParser     = require( "body-parser" ),
    utils          = require( "../../utils/utils" ),
    vent           = require( "./vent/vent-api" ),
    vent_auth      = require( "./vent/vent-auth-api" ),
    token          = require( "./vent/token-api" ),
    api_middleware = require( "./middleware/metric-middleware" ).api;

var app = module.exports = express();

/**
 * Configure unauthorized middleware.
 */
app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( api_middleware );

app.use( "/", vent );
app.use( "/token", token );
app.use( "/", vent_auth );
