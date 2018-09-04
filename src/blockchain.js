let Block = require("./block");

function Blockchain() {
  this.chain = [this.genesisBlock()];
  this.miningJobs = {};
  this.pending_transactions = [];
  this.currentDifficulty = 3;
  this.reward = 50;
  this.rewardThreshold = 3;
}

Blockchain.prototype.getCurrentReward = function() {
  return this.reward;
};

Blockchain.prototype.getCurrentThreshold = function() {
  return this.rewardThreshold;
};

Blockchain.prototype.calculateRewards = function() {
  let currentBlocks = this.chain.length;
  let isThresholdReached = currentBlocks / this.rewardThreshold;
  if (isThresholdReached > 1) {
    this.reward = this.reward / 2;
    this.rewardThreshold = this.rewardThreshold * 3;
  }

  return isThresholdReached;
};

Blockchain.prototype.genesisBlock = function() {
  return new Block(
    0,                          // Index
    Array(64).join("0"),        // BlockHash
    0,                          // PreviousHash
    Array(64).join("0"),        // Mined BY
    new Date().toISOString(),   // Date Created
    0,                          // Difficulty
    0,                          // Nonce
    []                          // Transactions
  );
};

Blockchain.prototype.exposeChain = function() {
  return this.chain;
};

Blockchain.prototype.getLatestBlock = function() {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.getBlockByHash = function(currentHash) {
  return this.chain.filter(block => block.blockHash === currentHash);
};

Blockchain.prototype.getBlockByIndex = function(index) {
  return this.chain[index];
};

Blockchain.prototype.addBlock = function(block) {
  this.chain.push(block);
};

Blockchain.prototype.cumulativeDifficulty = function() {
  let df = 0;
  for (let x = 0; x <= this.chain.length; x++) {
    df += Math.pow(2, this.currentDifficulty);
  }
  return df;
};

Blockchain.prototype.updateChain = function(chainBlocks) {
  this.chain = chainBlocks;
  this.miningJobs = {};
  this.pending_transactions = [];
};

module.exports = Blockchain;
