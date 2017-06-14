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

    config.services = {
      credit : {
        url : config.host.url,
        port : config.host.port,
        path : "/credit",
        toString : function() {
            return toURL( this.url, this.port ) + this.path;
        }
      },

      zillow : {
        url : config.host.url,
        port : config.host.port,
        path : "/zillow",
        toString : function() {
            return toURL( this.url, this.port ) + this.path;
        }
      },
    };

    // Configure the pub sub components.
    config.pubsub = {
        // twitter :  config.production && process.env.DISABLE_TWITTER !== "true"
    };
    return config;

}());

function toURL(url, port) {
    return url + (port ? ":" + port : "");
}
