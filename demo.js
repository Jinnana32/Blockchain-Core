const elliptic = require('elliptic');
const secp256k1 = new elliptic.ec('secp256k1');
const crypto = require('crypto-js');
const Wallet = require('./core/wallet');
const MLwallet = new Wallet(secp256k1, crypto);

let PrivateKey = MLwallet.createNewWallet();

console.log("New Private key: " + PrivateKey);

let walletInfo = MLwallet.getWalletInfo(PrivateKey);

console.log("Wallet info: " , JSON.stringify(walletInfo));

let Pubkey = MLwallet.getPublicKeyFromPrivateKey(PrivateKey);

console.log("Pubkey: " + Pubkey);

let address = MLwallet.getAddressFromPrivateKey(PrivateKey);

console.log("Address: " + address);

let signature = MLwallet.sign("Hello world", PrivateKey);

console.log("Signed Data: " , JSON.stringify(signature));

let isVerified = MLwallet.verifySignature("Hello world", Pubkey, signature);

console.log("Is Verified: " + isVerified);

let decompressedPub = MLwallet.decompressPublicKey(Pubkey);

console.log("Decompress public key: " ,JSON.stringify(decompressedPub));