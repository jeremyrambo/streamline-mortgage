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

    var body = Buffer.concat(chunks).toString('utf8');

    // console.log( "body:", JSON.parse(body));

    publisher.publish( "mortgage-decision", JSON.parse(body) );

    _end.apply(response, arguments);
  };

  next();
};
