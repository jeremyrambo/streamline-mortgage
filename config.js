var fs = require( "fs" );

module.exports = (function() {

    var config = {};

    config.env = process.env.ENVIRONMENT;
    if ( config.env === undefined ) {
        if ( process.env.DATABASE_URL ) {
            config.env = "production";
        }
        else {
            config.env = "localhost";
        }
    }

    // We define the database URL in heroku, we know we are in production
    config.domainName = "streamline-mortgage";

    config.minified = process.env.STREAMLINE_MORTGAGE_MINIFIED === "minified";

    // Configure the production environment.
    if ( config.env === "production" ) {
        config.production = true;
        config.databaseURL = process.env.DATABASE_URL;

        config.host = {
            url : "http://streamline-mortgage.sh",
            port : process.env.PORT,
            toString : function() {
                return toURL( this.url );
            }
        };


        config.notifier = {
            url : "http://streamline-mortgage.sh",
            path : "/ps",
            toString : function() {
                return toURL( this.url ) + this.path;
            }
        };
    }

    // Configure the test environment.
    else if ( config.env === "test" ) {
        config.production = false;
        config.databaseURL = process.env.DATABASE_URL;

        config.host = {
            url : "http://streamline-mortgage-test.herokuapp.com",
            port : process.env.PORT,
            toString : function() {
                return toURL( this.url );
            }
        };


        config.notifier = {
            url : "http://streamline-mortgage-test.herokuapp.com",
            path : "/ps",
            toString : function() {
                return toURL( this.url ) + this.path;
            }
        };
    }

    // Configure local development environment.
    else {
        // Local configuration mode
        config.production = false;
        // config.minified = true;
        config.databaseURL = "postgres://sm:password@localhost:8083/sm";

        config.host = {
            url : "http://localhost",
            port : fs.existsSync("/usr/bin/heroku") ? 5000 : 8080,
            toString : function() {
                return toURL( this.url, this.port );
            }
        };

        config.notifier = {
            url : config.host.url,
            port : config.host.port,
            path : "/ps",
            toString : function() {
                return toURL( this.url, this.port ) + this.path;
            }
        };
    }


    // Configure the pub sub components.
    config.pubsub = {
        // twitter :  config.production && process.env.DISABLE_TWITTER !== "true"
    };
    return config;

}());

function toURL(url, port) {
    return url + (port ? ":" + port : "");
}
