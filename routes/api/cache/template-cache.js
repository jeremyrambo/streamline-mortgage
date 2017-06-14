
var _local_cache = [];

module.exports.flushCronTime = function(){
	// "{seconds} {minutes} {hours} {days of month} {months} {days of week}"
	return "0 1 * * * *";
};

module.exports.data = function () {
	return _local_cache;
};

module.exports.flush = function() {
	// Flush and repopulate the _local_cache.
};