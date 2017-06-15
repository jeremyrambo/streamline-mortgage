var InfiniteLoop    = require( "infinite-loop" ),
    gatherer        = require( "./machine/gatherer" ),
    simulator       = require( "./machine/simulator" ),
    rateAdapter     = require( "./machine/rate-adapter" ),
    dbconnector     = require( "../../routes/api/db/dbconnector" );


var data = simulator.fabricate( 30 );

function simulate () {
  simulator.simulate( data );
}

var ilsim = new InfiniteLoop;
ilsim.add( simulate, [])
  .setInterval( 5000 )
  .run();

var ilgather = new InfiniteLoop;
ilgather.add( gatherer.gather, [])
  .setInterval( 5000 )
  .run();

// simulate();
function learn() {

  rateAdapter.adapt.grade( 'A' );
  // rateAdapter.adapt.grade( 'B' );
  // rateAdapter.adapt.grade( 'C' );
  // rateAdapter.adapt.grade( 'D' );
  // rateAdapter.adapt.grade( 'E' );
  // rateAdapter.adapt.grade( 'F' );
  // rateAdapter.adapt.grade( 'G' );
}

// apply machine learning
var iladapt = new InfiniteLoop;
iladapt.add( learn, [])
  .setInterval( 5000 )
  .run();
