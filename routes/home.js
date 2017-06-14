var config			= require( "../config" ),
    utils  			= require( "../utils/utils" ),
    metric_db       = require( "./api/db/metric-db" );

module.exports = function(request, response, next ) {


	var source_ip = utils.http.source_ip( request );
	var userAgent = utils.http.userAgent( request );

	metric_db.log_home( userAgent, source_ip );


    var homeFilePath = __dirname;
    homeFilePath += "/../public/html";
    homeFilePath += config.minified ? "/index.min.html" : "/index.html";

    utils.sendFile( response, homeFilePath );
}