var metric_db 	    = require( "../db/metric-db" ),
    utils           = require( "../../../utils/utils" );

var responseHandler = utils.responseHandler;

module.exports.api = function( request, response, next ) {


	var source_ip  = utils.http.source_ip( request );
	var userAgent = utils.http.userAgent( request );

	metric_db.log_api( request.url, userAgent, source_ip );

	next();
};