const crypto = require('crypto-js');

const addressFormat = /^[0-9a-f]{40}$/;
const publicKeyFormat = /^[0-9a-f]{65}$/;

function validateAddress(address){
    return (typeof(address) !== 'string') ? false : addressFormat.test(address);
}

function validatePubkey(publicKey){
    return (typeof(publicKey) !== 'string') ? false : publicKeyFormat.test(publicKey);
}

function validatePOW(blockhash, diffuculty){
    return (blockhash.substring(0, diffuculty) === Array(diffuculty + 1).join("0")) ? true : false;    
}

function SHA256(data){
    return crypto.SHA256(data).toString();
}

module.exports = {
    validateAddress,
    validatePubkey,
    validatePOW,
    SHA256
}