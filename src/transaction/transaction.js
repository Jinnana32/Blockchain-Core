const SVutils = require('../utility/sv');
const SHA256 = require('crypto-js/sha256');

function Transaction(from,to,amount){
    this.from = from;
    this.to = to;
    this.amount = amount;
    /*this.fee = fee;
    this.dateCreated = dateCreated;
    this.senderPubKey = senderPubKey;
    this.transactionDataHash = transactionDataHash;
    this.calculateDataHash();
    this.senderSignature = senderSignature;
    this.minedInBlockIndex = null;
    this.transferSuccessful = true;*/
}

Transaction.prototype.calculateDataHash = function() {
    let tranData = {
        'from': this.from,
        'to': this.to,
        'value': this.value,
        'fee': this.fee,
        'dateCreated': this.dateCreated,
        'data': this.data,
        'senderPubKey': this.senderPubKey
    };
    let tranDataJSON = JSON.stringify(tranData);
    this.transactionDataHash = SHA256(tranDataJSON).toString();
}

module.exports = Transaction;