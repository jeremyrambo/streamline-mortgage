var dbconnector = require( "./dbconnector" ),
    config      = require( "../../../config" );

exports.by = {

	global : {

		recent_messages : function( page, callback ){
			var offset = (20 * ((page > 0 ) ? (page - 1) : 0 ));

			dbconnector.connect( function(connection) {
		        var recent_messages_query = {
		            name  : "recent_messages_query",
		            text  : "SELECT * " +
		            		"  FROM vent.message " +
		                    " ORDER BY created_on DESC " +
		                    "OFFSET $1 " +
		                    " LIMIT 20",
		            values: [ offset ]
		        };
		        connection.query( recent_messages_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
		        });
			});
		}
	},

	session : {
		
		exists : function( session, callback ) {

			exports.by.session.count( session, function( err, result ) {
	            callback( err, { "exists" : result.count > 0 } );
			});
		},

		count : function( session, callback ) {

			dbconnector.connect( function(connection) {
		        var query = {
		            name  : "session_count_query",
		            text  : "SELECT count( * ) AS count" +
		            		"  FROM vent.session " +
		                    " WHERE name = lower($1)",
		            values: [ session ]
		        };
		        connection.query( query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
		        });
		    });

		},
		
		top_sessions : function( callback ) {
			dbconnector.connect( function(connection) {
				var top_sessions_query = {
		            name  : "top_sessions_query",
		            text  : "SELECT session_name, COUNT(session_name) " +
		                    "  FROM vent.message " +
		                    " GROUP BY session_name " +
		                    " ORDER BY count DESC " +
		                    " LIMIT 15" 
		        };
		        connection.query( top_sessions_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
		        });
			});
		}, 

		query : function( query, callback ) {
			dbconnector.connect( function(connection) {
				var query_sessions_query = {
		            name  : "query_sessions_query",
		            text  : "SELECT name " +
		                    "  FROM vent.session " +
		                    " WHERE name LIKE '%" + query + "%'"
				};
				connection.query( query_sessions_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
		        });
			});
		},

		all : function( callback ) {
			dbconnector.connect( function(connection) {
				var all_sessions_query = {
		            name  : "all_sessions_query",
		            text  : "SELECT * FROM vent.session"
				};
				connection.query( all_sessions_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
		        });
			});

		},

		info : function( session_name, callback ){

			dbconnector.connect( function(connection) {
				var info_sessions_query = {
		            name  : "info_sessions_query",
		            text  : "SELECT * " +
		                    "  FROM vent.session " +
		                    " WHERE name = $1 ",
		            values: [ session_name ]
				};
				connection.query( info_sessions_query, function(err, result) {
		            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
		        });
			});
		},


		messages : {

			_message_limit : 15,

			_offset : function( page ){
				return (exports.by.session.messages._message_limit * ((page > 0 ) ? (page - 1) : 0 ));
			},

			query : function( session, page, callback ) {
				var offset = exports.by.session.messages._offset( page );

				dbconnector.connect( function(connection) {
			        var query = {
			            name  : "messages_by_session",
			            text  : "SELECT m.* " + 
			            		"  FROM vent.message m, vent.message_hierarchy mh" +
			                    " WHERE m.id = mh.parent_id" +
			                    "   AND m.session_name = lower($1)" +
			                    "   AND m.domain_name = $2" +
			                    " ORDER BY created_on DESC" +
			                    " OFFSET $3" +
			                    " LIMIT $4",
			            values: [ session, config.domainName, offset, exports.by.session.messages._message_limit ]
			        };
			        connection.query( query, function(err, result) {

			            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
			        });
			    });
			},

			add : function( session, message, userAgent, location, callback ) {
				exports.by.session.messages.reply( session, message, userAgent, location, undefined, callback );
			},

			get : function( session, id, callback ) {
				dbconnector.connect( function(connection) {
			        var query = {
			            name  : "messages_get",
			            text  : "SELECT * FROM vent.message " +
			                    " WHERE id = $1" + 
			                    "   AND session_name = lower($2)",
			            values: [ id, session ]
			        };
			        connection.query( query, function(err, result) {
			            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0] );
			        });
			    });
			},

			replies : function( session, id, callback ){
				dbconnector.connect( function(connection) {
			        var query = {
			            name  : "messages_replies",
			            text  : "WITH RECURSIVE replies( parent_id, id, depth, message, session_name, domain_name, created_on) AS ( " +
								" SELECT mr.parent_id, mr.child_id AS id, 1, m.message, m.session_name, m.domain_name, m.created_on " +
								"   FROM vent.message_relationship mr, vent.message m  " +
								"  WHERE mr.parent_id = $1 " +
								"    AND m.session_name = $2 " +
								"    AND m.id = mr.child_id " +
								"UNION ALL " +
								" SELECT r.parent_id, mr.child_id AS id, r.depth + 1, m.message, m.session_name, m.domain_name, m.created_on  " +
								"   FROM vent.message_relationship mr, replies r, vent.message m   " +
								"  WHERE r.id = mr.parent_id " +
								"    AND m.id = mr.child_id " +
								"    AND m.session_name = $2 " +
								"    AND r.depth < 50 " +
								"  ) " +
								" SELECT * FROM replies " +
								"  ORDER BY created_on DESC " +
			                    "  LIMIT 25",
			            values: [ id, session ]
			        };

			        connection.query( query, function(err, result) {
			            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
			        });
			    });
			}, 

		    repliesIn : function( session, message_ids, callback ){
				dbconnector.connect( function(connection) {
			        var query = {
			            name  : "messages_replies_in",

			            text  : "WITH RECURSIVE replies( parent_id, id, depth, message, session_name, domain_name, created_on) AS ( " +
								" SELECT mr.parent_id, mr.child_id AS id, 1, m.message, m.session_name, m.domain_name, m.created_on " +
								"   FROM vent.message_relationship mr, vent.message m  " +
								"  WHERE mr.parent_id IN (" + message_ids.join(",") + ")" +
								"    AND m.session_name = $1 " +
								"    AND m.id = mr.child_id " +
								"UNION ALL " +
								" SELECT r.parent_id, mr.child_id AS id, r.depth + 1, m.message, m.session_name, m.domain_name, m.created_on  " +
								"   FROM vent.message_relationship mr, replies r, vent.message m   " +
								"  WHERE r.id = mr.parent_id " +
								"    AND m.id = mr.child_id " +
								"    AND m.session_name = $1 " +
								"    AND r.depth < 50 " +
								"  ) " +
								" SELECT * FROM replies " +
								"  ORDER BY created_on DESC ",
			            values: [ session ]
			        };

			        connection.query( query, function(err, result) {
			            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
			        });
		        });
		    },

			reply : function( session, message, userAgent, location, parent_id, callback ) {
				dbconnector.liveConnect( function(connection) {
					connection.query( "BEGIN", function(err, result) {
			            if ( err ) {
			                dbconnector.rollback( connection );
			                callback( err, undefined );
			            }

						var add_message_query = {
				            name  : "messages_add",
				            text  : "INSERT INTO vent.message (domain_name, session_name, message, location, agent)" +
				             		" VALUES ($1, $2, $3, $4, $5)" +
				                    " RETURNING id",
				            values: [ config.domainName, session, message, location, userAgent ]
				        };

				        connection.query( add_message_query, function(err, result) {
				        	if ( err || result.rowCount === 0 ) {
			                    dbconnector.rollback( connection );
			                    return callback( err, undefined );
			                }

			                var message_id = result.rows[0].id;

					        if ( parent_id === undefined ) {

				                // There is no parent ID which makes this a root message in 
				                // a conversation hierarchy.  Add it to the message hierarchy 
				                // table to maintain the root structures.
							    var add_hierarchy_query = {

						            name  : "message_add_hierarchy",
						            text  : "INSERT INTO vent.message_hierarchy (parent_id)" +
						             		" VALUES ($1)",
						            values: [ message_id ]
						        }; 


						        connection.query( add_hierarchy_query, function(err, result) {
						        	if ( err || result.rowCount === 0 ) {
					                    dbconnector.rollback( connection );
					                    return callback( err, undefined );
					                }

					                commitTransaction( message_id, callback );
						        });
					        }
					        
					        else {

						        // At this point we have the message and need to relate it to the parameter parent id.
						        var add_relationship_query = {

						            name  : "messages_add_relationship",
						            text  : "INSERT INTO vent.message_relationship (parent_id, child_id)" +
						             		" VALUES ($1, $2)",
						            values: [ parent_id, message_id ]
						        };

						        connection.query( add_relationship_query, function(err, result) {
						        	if ( err || result.rowCount === 0 ) {
					                    dbconnector.rollback( connection );
					                    return callback( err, undefined );
					                }

					                commitTransaction( message_id, callback );
						        });

					        }

					        function commitTransaction( message_id, callback ){
			                    // Commit transaction
			                    connection.query( "COMMIT", function(err) {
			                        if ( err ) {
			                            dbconnector.rollback( connection );
			                            return callback( err, undefined );
			                        }

			                        connection.end();
			                        callback( err, message_id );
			                    });
			                }
					    });
					});				
				});
			}, 


		    stats : {
			    query : function( session, message_ids, callback ) {

			    	dbconnector.connect( function( connection ) {
			    		var query = "SELECT * FROM vent.message_stats " + 
			    		            " WHERE parent_id IN (" + message_ids.join(",") + ")" +
			    		            " ORDER BY created_on DESC";

				        connection.query( query, function(err, result) {
				            callback( err, err || result.rowCount === 0 ? undefined : result.rows );
				        });
			    	});
			    },

			    like : function( session, message_id, userAgent, source_ip, callback ){
			    	dbconnector.connect( function( connection ) {
			    		var query = {
			    			name : "like_message",
			    			text : "INSERT INTO vent.message_stats (parent_id, liked, source_ip, agent) " +
			    			       "VALUES ($1, $2, $3, $4)",
			    			values: [ message_id, true, source_ip, userAgent ]
			    		}

			    		connection.query( query, function( err, result ) {
			    			callback( err, err || result.rowCount === 0 ? undefined : message_id );
			    		});
			    	});
			    }
		    }
		}
	},

	riddle : {

		/* 
		 * Gets all riddles.
		 */
		all : function( callback ) {
			dbconnector.connect( function( connection ) {
				var all_riddles_query = {
					name  : "all_riddles_query",
					text  : "SELECT * FROM vent.riddle"
				};
				connection.query( all_riddles_query, function( err, result ) {
					callback( err, err || result.rowCount === 0 ? undefined : result.rows );
				});
			});
		}
	}

} 

exports.add = {

	/* 
	 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
	 */
	domain : function( callback ){
		console.log( "adding root domain: [" + config.domainName + "]." );
		dbconnector.liveConnect( function(connection) {
	        var query = {
	            name  : "vent_by_domain",
	            text  : "SELECT name FROM vent.domain " +
	                    " WHERE name = $1",
	            values: [ config.domainName ]
	        };
	        connection.query( query, function(err, result) {

	        	if( err ) {
	        		console.log( "Fatal error while adding the root domain [ " + config.domainName + "] for this instance: " + err );

			        connection.on( "drain", connection.end.bind(connection) );
	        		callback( err, err );
	        	}
	        	else {

		        	if( result.rowCount === 0 ){
						var add_domain_query = {
				            name  : "add_domain_query",
				            text  : "INSERT INTO vent.domain (name) values ($1)" +
				                    " RETURNING name",
				            values: [ config.domainName ]
				        };
				        connection.query( add_domain_query, function(err, result) {
				            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0].name );
					        connection.on( "drain", connection.end.bind(connection) );
				        });
		        	}
		        	else {
			            callback( err, result.rows[0].name );
				        connection.on( "drain", connection.end.bind(connection) );
			        }
			    }
	        });
	    });
	},

	/* 
	 * Adds the configured domain (see config.domainName) if it doesn't already exist in the database
	 */
	session : function( session, logoUrl, callback ){
		exports.by.session.exists( session, function( err, result ) {
			if( err || result.exists === true ){
				callback( err, session );
			}
			else {
				dbconnector.connect( function(connection) {
					var add_session_query = {
			            name  : "vent_add_session",
			            text  : "INSERT INTO vent.session (name, logo_url ) values ($1, $2)" +
			                    " RETURNING name",
			            values: [ session, logoUrl ]
			        };
			        connection.query( add_session_query, function(err, result) {
			            callback( err, err || result.rowCount === 0 ? undefined : result.rows[0].name );
			        });
				});
			}
		});
	}
}