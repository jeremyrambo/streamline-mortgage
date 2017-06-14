var vent_db   = require( "../db/vent-db" );

var _local_cache = [];

module.exports.flushCronTime = function(){
	// "{seconds} {minutes} {hours} {days of month} {months} {days of week}"
	// return "1 1 * * * *";
	return "0 1 * * * *";
};

module.exports.data = function () {
	return _local_cache;
};

module.exports.flush = function() {
	vent_db.by.riddle.all(  function( err, riddles ) {
		if ( err ) {
			console.log( "Error populating riddle cache: " + err );
			return;
		}
		if ( riddles ) {
			_local_cache = riddles;	
		}
	});
};