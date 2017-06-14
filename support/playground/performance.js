


Array.apply(0, Array(100)).map(function (x, y) { 
	console.log( x + ":"+ y );
    var nb = y+1;
    var isFizz = ((nb % 3) == 0);
    var isBuzz = ((nb % 5) == 0);
    var isFizzBuzz = (isFizz && isBuzz);
    
    if (isFizzBuzz) return 'fizzbuzz';  
    if (isFizz) return 'fizz';
    if (isBuzz) return 'buzz';
    return(nb);
                                               
}).join("\n"));