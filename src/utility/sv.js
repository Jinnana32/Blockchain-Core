const CryptoJS = require("crypto-js");
const EC = require('elliptic').ec;
const secp256k1 = new EC('secp256k1');

function sign(data, pk){
    let keyPair = secp256k1.keyFromPrivate(privKey);
    let signature = keyPair.sign(data);
    return [signature.r.toString(16), signature.s.toString(16)];
}

function decompressPublicKey(pubKeyCompressed) {
    let pubKeyX = pubKeyCompressed.substring(0, 64);
    let pubKeyYOdd = parseInt(pubKeyCompressed.substring(64));
    let pubKeyPoint = secp256k1.curve.pointFromX(pubKeyX, pubKeyYOdd);
    return pubKeyPoint;
}

function verify(data, publicKey, signature) {
    let pubKeyPoint = decompressPublicKey(publicKey);
    let keyPair = secp256k1.keyPair({pub: pubKeyPoint});
    let valid = keyPair.verify(data, {r: signature[0], s: signature[1]});
    return valid;
}

module.exports = {
    sign,
    verify
}