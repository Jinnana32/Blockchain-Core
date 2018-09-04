const utils = require("./utility/common");

let Block = function(
  index,
  blockHash,
  previousHash,
  minedBy,
  dateCreated,
  difficulty,
  nonce,
  transactions
) {
  this.index = index;
  this.blockHash = blockHash;
  this.blockDataHash = this.calculateBlockDataHash();
  this.previousHash = previousHash;
  this.minedBy = minedBy;
  this.dateCreated = dateCreated;
  this.difficulty = difficulty;
  this.nonce = nonce;
  this.transactions = transactions;
};

Block.prototype.calculateBlockDataHash = function() {
  let blockDataHash = {
    index: this.index,
    transactions: this.transactions,
    difficulty: this.difficulty,
    previousHash: this.previousHash,
    minedBy: this.minedBy
  };
  return utils.SHA256(JSON.stringify(blockDataHash)).toString();
};

module.exports = Block;
