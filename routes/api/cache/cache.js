var cron_job       	= require( "cron" ).CronJob,
    vent_db     	= require( "../db/vent-db" ),
    riddle_cache 	= require( "./riddles-cache" ),
    session_cache   = require( "./sessions-cache"),
    levenshtein     = require( "fast-levenshtein" ),
    cache_repos     = {

		"riddles"   : riddle_cache,
		"riddle"    : riddle_cache,
		"sessions"  : session_cache,
		"session"   : session_cache

	};

module.exports.flush = function( type ) {

	var _cache = cache_repos[ type ];
	if ( _cache === undefined ) {
		console.log( "Unexpected cache type of '" + type + "'." );
		return;
	}

	_cache.flush();
}

module.exports.all = function( type, callback ) {
		
	if ( callback === undefined ) {
		console.log( "Callback must be provided when requesting 'all' cache instances." );
		return;
	}

	var _cache = cache_repos[ type ];
	if ( _cache === undefined ) {
		console.log( "Unexpected cache type of '" + type + "'." );
		return;
	}

	var _data = _cache.data();
	if ( _data === undefined || _data.length === 0 ) {
		// No cached data, try flushing and attempt to retrieve again.
		_cache.flush();
		_data = _cache.data();
	}


	callback( _data );
	return;
};


/**
 * This function will randomly select an instance of the underlying cache repository.  
 * The optional "avoid" parameter will guarantee that index is not returned.
 */ 
module.exports.random = function( type, avoid, callback ) {
	
	if ( callback === undefined ) {
		console.log( "Callback must be provided when requesting a 'random' cache instance." );
		return;
	}

	module.exports.all( type, function( _data ) {
		
		
		// Get a random number between 0 and the length of the riddle array;
		var _avoid = avoid ? avoid : -1;
		var _rand = Math.floor((Math.random() * (_data.length - 1)));
		while ( _rand === _avoid ){
			_rand = Math.floor((Math.random() * (_data.length - 1)));
		}

		callback( _data[ _rand ] );
		return;
	});
};

/** 
 * This function will match an underlying cache repository for data that exactly matches the 
 * corresponding query_object.  The query object syntax is a valid JSON object where 
 * 'keys' of the object match a corresponding key in the underlying cache repository
 * payload.
 *  
 */
module.exports.match  = function( type, query_object, callback ) {

	if ( callback === undefined ) {
		console.log( "Callback must be provided when requesting 'query' cache instance(s)." );
		return;
	}

	module.exports.all( type, function( _data ) {

		var _results = [];

		var _query_keys = Object.keys( query_object );
		if( _query_keys.length === 1 ){

			var compare_to = query_object[ _query_keys[0] ];

			for( var x = 0; x < _data.length; x++ ) {

				if ( compare_to === _data[ x ][ _query_keys[0] ] ) {
					_results.push( _data[ x ] );
				}
			}
		}
		else {
			console.log( "Querying for multiple keys is not yet supported." );
		}

		callback( _results );
	});
};


/** 
 * This function will query an underlying cache repository for data that matches the 
 * corresponding query_object.  The query object syntax is a valid JSON object where 
 * 'keys' of the object match a corresponding key in the underlying cache repository
 * payload.
 * 
 * The primary search is a case insensitive regular expression match.  However, if the 
 * query contains more than three or more characters an addition Levenshtein search is
 * performed to offset user mistakes (fat fingering).
 * 
 * For example:
 *  Repo content : [ { "name" : "statefarm" }, {"name" : "att" } ].
 * 
 *  1. Query: { "name" : "st" }
 *     The underlying data model of the cache repository will query all "name" fields 
 *     for the the characters "st" which will return [ { "name" : "statefarm" } ].
 *  
 *  2. Query: { "name" : "AT" }
 *     The underlying data model of the cache repository will query all "name" fields 
 *     for the the character "AT" which will return [ { "name" : "statefarm" }, {"name" : "att" } ]. 
 *  3. Query: { "name" : "stt" }
 *
 *     The underlying data model of the cache repository will query all "name" fields 
 *     for the the character "stt" which will return [ { "name" : "statefarm" }, {"name" : "att" } ]. 
 *     In this situation the Levenshtein formula is leveraged to match "sta" and "att" with a 
 *     Levenshtein distance of 1.  This considered a healthy match.
 *  
 */
module.exports.query  = function( type, query_object, callback ) {

	if ( callback === undefined ) {
		console.log( "Callback must be provided when requesting 'query' cache instance(s)." );
		return;
	}

	module.exports.all( type, function( _data ) {

		var _results = [];

		var _query_keys = Object.keys( query_object );
		if( _query_keys.length === 1 ){

			var compare_to       = query_object[ _query_keys[0] ];
			var compare_regexp   = new RegExp( compare_to, "gi" );
			var substring_cutoff = compare_to.length;

			for( var x = 0; x < _data.length; x++ ) {

				var compare_against = _data[ x ][ _query_keys[0] ];

				// Run the exact match first, this is much faster and clearly accurate.
				if ( compare_regexp.test( compare_against ) !== false ) {
					_results.push( _data[ x ] );
				}
				// Levenshtein won't be effective until we have more content to match, skip until the 
				// query size is 3 or more.
				else if ( substring_cutoff > 2 ) {
					var distance = levenshtein.get( compare_against, compare_to );

					// Match based on a factor of the distance. 
					if ( distance <= (substring_cutoff - 2) ) {
						_results.push( _data[ x ] );
					}
				}

			}
		}
		else {
			console.log( "Querying for multiple keys is not yet supported." );
		}

		callback( _results );
	});
};


// Setup and start the crons (flush) for each cache.
for ( var _cache in cache_repos ){
	console.log( "Cache: " + _cache );
	cache_repos[ _cache ].flush();

	new cron_job(
	    {
	      cronTime: cache_repos[ _cache ].flushCronTime(),
	      onTick: function() {
	      	console.log( "flushing cache: " + _cache );
			cache_repos[ _cache ].flush();
	      },
	      timeZone: "America/Chicago"
	    }
	).start();
}