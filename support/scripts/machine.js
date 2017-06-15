var InfiniteLoop    = require( "infinite-loop" ),
    gatherer        = require( "./machine/gatherer" ),
    simulator       = require( "./machine/simulator" ),
    dbconnector     = require( "../../routes/api/db/dbconnector" );


var data = simulator.fabricate( 30 );

function simulate () {
  simulator.simulate( data );
}

// var ilsim = new InfiniteLoop;
// ilsim.add( simulate, [])
//   .setInterval( 5000 )
//   .run();

var ilgather = new InfiniteLoop;
ilgather.add( gatherer.gather, [])
  .setInterval( 5000 )
  .run();
