const axios = require('axios');
const utils = require('./utility/common');

function Network(host, port, blockchain, TransactionManager){
    let id = utils.SHA256(new Date().toISOString()).substring(0,20);
    this.nodeId = id;
    this.host = host;
    this.port = port;
    this.networkUrl = `http://${host}:${port}`;
    this.nodes = [];
    this.blockchain = blockchain;
    this.chainID = this.blockchain.chain[0].blockHash;
    this.TransactionManager = TransactionManager;
}

Network.prototype.nodeHash = function(nodeUrl){
    if(this.nodes.indexOf(nodeUrl) === -1) return false;
    return true;
}

Network.prototype.isCurrentNode = function(nodeUrl){
    if(this.networkUrl !== nodeUrl) return false;
    return true;
}

Network.prototype.syncNodeChains = function(connectingNodeInfo){
    let connectingDiff = connectingNodeInfo.cumulativeDifficulty;
    let currentDiff = this.blockchain.cumulativeDifficulty();
}

Network.prototype.matchChain = function(connectingNode){
    let connectingNodeChain = connectingNode.cumulativeDifficulty;
    let currentNodeChain = this.blockchain.cumulativeDifficulty();
    if(connectingNodeChain > currentNodeChain){
        axios.get(`${connectingNode.nodeUrl}/blocks`)
             .then(function(chain){
                this.getLongerChain(chain);
             })
             .catch();
    }
}

Network.prototype.getLongerChain = function(chain){
    this.blockchain.chain = chain;
    this.blockchain.pending_transactions = [];
}

module.exports = Network;