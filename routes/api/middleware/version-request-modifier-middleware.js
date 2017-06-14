

// var version_regex = /(\.js|\.css);[0-9]+/gi

// module.exports = function( request, response, next ){

// 	console.log( "match: " + request.path + " : " + version_regex.test( request.path ) );

// 	if ( version_regex.test( request.path ) ) {
// 		response.redirect( request.path.substring( 0, request.path.indexOf(";")) );
// 		return;
// 	}

// 	next();
// };