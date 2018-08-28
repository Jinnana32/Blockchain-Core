function Wallet(secp256k1, crypto){
    this.secp256k1 = secp256k1;
    this.crypto = crypto;
}

Wallet.prototype.createNewWallet = function(){
    let keyPair = this.secp256k1.genKeyPair();
    return keyPair.getPrivate().toString(16);
}

Wallet.prototype.getWalletInfo = function(privateKey){
    let wallet = {
        PrivateKey: privateKey,
        PublicKey: this.getPublicKeyFromPrivateKey(privateKey),
        Address: this.getAddressFromPrivateKey(privateKey)
    }
    return wallet;
}

Wallet.prototype.getAddressFromPrivateKey = function(privateKey){
    let pubKey = this.getPublicKeyFromPrivateKey(privateKey);
    let address =  this.crypto.RIPEMD160(pubKey);
    return address.toString();
}

Wallet.prototype.getAddressFromPublicKey = function(pubKey){
    let address = this.crypto.RIPEMD160(pubKey);
    return address;
}

Wallet.prototype.getPublicKeyFromPrivateKey = function(privateKey){
    let keyPair = this.secp256k1.keyFromPrivate(privateKey);
    let pubKey = keyPair.getPublic().getX().toString(16) + 
            (keyPair.getPublic().getY().isOdd() ? "1" : "0");
    return pubKey;
}

Wallet.prototype.sign = function(data, privateKey){
    let keyPair = this.secp256k1.keyFromPrivate(privateKey);
    let signature = keyPair.sign(data);
    return [signature.r.toString(16), signature.s.toString(16)];
}

Wallet.prototype.decompressPublicKey = function(pubKeyCompressed) {
    let pubKeyX = pubKeyCompressed.substring(0, 64);
    let pubKeyYOdd = parseInt(pubKeyCompressed.substring(64));
    let pubKeyPoint = this.secp256k1.curve.pointFromX(pubKeyX, pubKeyYOdd);
    return pubKeyPoint;
}

Wallet.prototype.verifySignature = function(data, publicKey, signature){
    let pubKeyPoint = this.decompressPublicKey(publicKey);
    let keyPair = this.secp256k1.keyPair({pub: pubKeyPoint});
    let valid = keyPair.verify(data, {r: signature[0], s: signature[1]});
    return valid;
}

module.exports = Wallet;