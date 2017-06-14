var express        = require( "express" ),
	  compression    = require( "compression" ),
	  bodyParser     = require( "body-parser" ),
    utils          = require( "../../utils/utils" ),
    sm             = require( "./sm/sm-api" ),
    api_middleware = require( "./middleware/metric-middleware" ).api;

var app = module.exports = express();

/**
 * Configure unauthorized middleware.
 */
app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( api_middleware );

app.use( "/", sm );
