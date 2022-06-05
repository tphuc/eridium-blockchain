var EC = require('elliptic').ec;

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// // Generate keys
// var key = ec.genKeyPair();

// // Sign the message's hash (input must be an array, or a hex-string)
// var msgHash = [ 'tran', 'bao', 'phuc' ];
// var signature = key.sign(msgHash);

// // // Export DER encoded signature in Array
// var derSign = signature.toDER();

// // // Verify signature
// console.log(key.verify(msgHash, derSign));
// console.log(key.getPublic('hex'))
// console.log(key.getPrivate('hex'))



/// -------
var key = ec.keyFromPublic('04a8bd568353daeb8908cd6883041138dd65b74a7243bfe516ab80e28e9868518c556e757885c0458807481579c860cb825ca65da565545504ffd66c177e79f562')
var msgHash = [ 'tran', 'bao', 'phuc' ];
var signature = key.sign(msgHash);
var derSign = signature.toDER();
console.log(key.verify(msgHash, derSign))


