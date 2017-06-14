var metric_db 	    = require( "../db/metric-db" ),
    publisher       = require( "../pub-sub/publisher" ),
    utils           = require( "../../../utils/utils" );

var responseHandler = utils.responseHandler;

module.exports = function( request, response, next ) {
  var _write = response.write,
      _end = response.end;

  let chunks = [];

  response.write = function (chunk) {
    chunks.push(chunk);

    _write.apply(response, arguments);
  };

  response.end = function (chunk) {
    if (chunk)
      chunks.push(chunk);

    if (chunks.length === 0 ){
      _end.apply( response, arguments );
    }
    console.log( 'chunks', chunks);
    var body = Buffer.concat(chunks).toString('utf8');

    publisher.publish( "api-event", {
      "path" : request.path,
      "method" : request.method,
      "response" : JSON.parse(body)
    });

    _end.apply(response, arguments);
  };

  next();
};
