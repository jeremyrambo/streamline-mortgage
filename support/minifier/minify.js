var fs = require( "fs" ),
    path = require( "path" ),
    compressor = require( "node-minify" );

// Remove current "min" folders to replace them with the new compressed versions
if ( fs.existsSync("../../public/min") ) {
    rmrf( "../../public/min" );
}

// Create directories
fs.mkdirSync( "../../public/min", 0755 );
fs.mkdirSync( "../../public/min/css", 0755 );
fs.mkdirSync( "../../public/min/js", 0755 );

// Scripts and styles that will be compressed
var compressibles = {
    scripts : {
        directives : new Compressible( [
            "../../public/js/directive/live-search-directive.js",
            "../../public/js/directive/footer-directive.js",
            "../../public/js/directive/masthead-directive.js",
            "../../public/js/directive/session-change-directive.js",
            "../../public/js/directive/sidebar-directive.js",
            "../../public/js/directive/focus-directive.js"
            ],
            "directives.min.js" ),

        services : new Compressible( [
            "../../public/js/service/loading-service.js",
            "../../public/js/service/util-service.js",
            "../../public/js/service/message-service.js",
            "../../public/js/service/riddle-service.js"
            ],
            "services.min.js" ),

        app : new Compressible( [
            "../../public/js/app.js",
            "../../public/js/app-resource.js",
            "../../public/js/controller/home-controller.js",
            "../../public/js/controller/navigation-controller.js",
            "../../public/js/controller/session-change-controller.js",
            "../../public/js/controller/session-monitor-controller.js",
            "../../public/js/controller/sidebar-controller.js",
            "../../public/js/controller/session-controller.js",
            "../../public/js/controller/message-controller.js"
            ],
            "app.min.js" )
    },

    styles : new Compressible( [
        "../../public/css/app.css"
        ],
        "app.min.css" )
};

compressJS( compressibles.scripts.directives );
compressJS( compressibles.scripts.services );
compressJS( compressibles.scripts.app );

compress( compressibles.styles, "../../public/min/css", "sqwish" );

/**
 * Adds a simple constructor style function to store compressible information.
 *
 * inputFiles: array representing the collection of scripts/styles/etc.
 * outputFile: the name of the combined/compressed script/style/etc. (rec: xxx.min.type)
 */
function Compressible(inputFiles, outputFile) {
    this.inputFiles  = inputFiles;
    this.outputFile = outputFile;
}

function compressJS(compressible) {
    compress( compressible, "../../public/min/js", "uglifyjs" );
}

function compress(compressible, outputFolder, method) {
    new compressor.minify( {
        type : method,
        fileIn :  compressible.inputFiles,
        fileOut : outputFolder + "/" + compressible.outputFile,
        callback : function(err) {
            if ( err ) {
                console.log( err );
                return;
            }

            console.log( "\n\nSuccessfully compressed: " + compressible.outputFile);
            for ( var i = 0; i < compressible.inputFiles.length; i++ ) {
                console.log( "   > " + compressible.inputFiles[i] );
            }
        }
    });
}

function rmrf(dir) {
    var list = fs.readdirSync( dir );
    for ( var i = 0; i < list.length; i++ ) {
        var filename = path.join( dir, list[i] );
        var stat = fs.statSync( filename );

        if ( filename === "." || filename === ".." ) {
            // Skip
        }
        else if ( stat.isDirectory() ) {
            // rmrf recursively
            rmrf( filename );
        }
        else {
            // rm fiilename
            fs.unlinkSync( filename );
        }
    }

    fs.rmdirSync( dir );
}
