var metric_db 	    = require( "../db/metric-db" ),
    publisher       = require( "../pub-sub/publisher" ),
    utils           = require( "../../../utils/utils" );

var responseHandler = utils.responseHandler;

module.exports = function( request, response, next ) {
  var _write = response.write,
      _end = response.end;

  var chunks = [];

  response.write = function (chunk) {
    chunks.push(chunk);

    _write.apply(response, arguments);
  };

  response.end = function (chunk) {
    if (chunk)
      chunks.push(chunk);

    try {

      _end.apply( response, arguments );
      var body = Buffer.concat(chunks).toString('utf8');

      publisher.publish( "api-event", {
        "path" : request.path,
        "method" : request.method,
        "response" : JSON.parse(body)
      });
    }catch(e){
      console.log( "error processing response body [chunks]: ", chunks, e );
    }


    _end.apply(response, arguments);
  };

  next();
};
