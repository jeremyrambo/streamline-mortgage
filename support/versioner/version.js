var fs   = require( "fs" ),
    path = require( "path" ),
    mv   = require( "mv" );


// var version_timestamp_regex = /VERSION_TIMESTAMP/g;
//
// var minified_index = "../../public/html/index.min.html";
//
// fs.readFile( minified_index, "UTF-8", function( err, data ) {
//     handleErr( err );
//
//     var version = new Date().getTime();
//     var versioned_data = data;
//
//     while( match = version_timestamp_regex.exec( versioned_data ) ){
//         versioned_data = versioned_data.replace( match[0], version );
//     }
//
//     handleErr( err );
//
//     fs.rename( minified_index, minified_index + ".bak", function( err ) {
//         handleErr( err );
//
//         fs.writeFile( minified_index, versioned_data, "UTF-8", function( err ) {
//             handleErr( err );
//         });
//     })
//
//     mv( "../../public/min", "../../public/" + version + "/min", {mkdirp: true}, function(err) {
//         // done. it first created all the necessary directories, and then
//         // tried fs.rename, then falls back to using ncp to copy the dir
//         // to dest and then rimraf to remove the source dir
//         handleErr( err );
//     });
// });
//
//
// function handleErr( err ){
//     if ( err ) {
//         throw err;
//     }
// }
//
