// SERVER 
const app = require('express')();
const bodyParser = require('body-parser');
const axios = require('axios');

// UTILITY
const utils = require('./src/utility/common');

// BLOCKHAIN
const Blockchain = require('./src/blockchain');
const Block = require('./src/block');
const Transaction = require('./src/transaction/transaction');
const TransactionManager = require('./src/transaction/TransactionManager');

let MagicLedger = new Blockchain();
let MLTransactionManager = new TransactionManager(MagicLedger);

// NETWORK NODES
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 4000;

const Network = require('./src/network');
const Node = new Network(host, port, MagicLedger, MLTransactionManager);

// ENABLE CROSS ORIGIN
const cors = require('cors');
app.use(cors());

// PARSE REQUEST BODY
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));  

// ========================= Blockchain Core API =======================

app.get('/info', (req, res) => {
    let chain = MagicLedger.chain;

    let info = {
        about: "Magic Ledger v1.0.0",
        nodeID: Node.nodeId,
        chainID: Node.chainID,
        nodeURL: Node.networkUrl,
        currentReward: Node.blockchain.getCurrentReward(),
        currentRewardThreshold: Node.blockchain.getCurrentThreshold(),
        peersConnected: Node.nodes.length,
        peers: Node.nodes,
        currentDifficulty: Node.blockchain.currentDifficulty,
        blocksCount: Node.blockchain.chain.length,
        cumulativeDifficulty: Node.blockchain.cumulativeDifficulty(),
        confirmedTransactions: Node.TransactionManager.getBlockTransactions().length,
        pendingTransctions:Node.TransactionManager.getPendingTransactions().length
    }

    res.send(JSON.stringify(info, 0, 4));
});

app.get('/debug', (req, res) => {

});

app.get('/debug/reset/chain', (req, res) => {
    MagicLedger.chain = [];
    MagicLedger.chain[0] = MagicLedger.genesisBlock();
    MagicLedger.pending_transactions = [];
    res.send({message: "Chain successfully reset."});
});

app.get('/debug/addblock/:number', (req, res) => {
    let blockNumber = req.params.number;
    for(let x = 1; x <= blockNumber; x++){
        let latestBlock = MagicLedger.getLatestBlock();
        
        let trans = {
            sender: utils.SHA256(x + " dummy me meme"),
            recipient: utils.SHA256(x + " wew wew wew wew"),
            amount: x * Math.random(0,299)
        };
        
        MagicLedger.chain.push(new Block(latestBlock.index + 1,
                                        utils.SHA256(x).toString(),
                                        latestBlock.blockHash, 
                                        utils.SHA256(x + "test"),
                                        new Date().toISOString(),
                                        MagicLedger.currentDifficulty,
                                        (x * Math.random(0,100) * 300),
                                        trans));
    }

    res.send(JSON.stringify(MagicLedger.exposeChain()));
});


app.get('/debug/mineblock/:address', (req, res) => {
    let latestBlock = MagicLedger.getLatestBlock();
    let previousHash = latestBlock.blockHash;
    let index = latestBlock.index;
    let dateCreated = new Date().toISOString();
    let nonce = Math.floor((Math.random() * 999) + 1);
    let blockHash = utils.SHA256(`${previousHash}|${dateCreated}|${nonce}`);
    let block = new Block(index + 1, blockHash, previousHash,req.params.address,dateCreated,MagicLedger.currentDifficulty,nonce, MLTransactionManager.getPendingTransactions());

    MagicLedger.addBlock(block);
    MLTransactionManager.clearPendingTransactions();

    res.send("New block has been created!");
});


app.get('/blocks/', (req, res) => {
    if(MagicLedger.chain.length < 0){
        MagicLedger.chain[MagicLedger.genesisBlock()];
    }
    res.send(JSON.stringify(MagicLedger.exposeChain()));
});

app.get('/blocks/:index', (req, res) => {
    let block = MagicLedger.getBlockByIndex(req.params.index);
    res.send(JSON.stringify(block));
});

// ========================= Transactions API ==================================

app.get('/transactions/pending', (req, res) => {
    if(MLTransactionManager.getPendingTransactions().length === 0) {
        res.json({
            Note: "No pending transactions"
        });
    }else{
        res.send(JSON.stringify(MLTransactionManager.getPendingTransactions()));
    }
});

app.get('/transactions/confirmed', (req, res) => {
    res.send(JSON.stringify(MLTransactionManager.getBlockTransactions()));
});

app.get('/transactions/:transHash', (req, res) => {
    res.send(JSON.stringify(MLTransactionManager.getTransactionsByHash(req.params.transHash)))
});

app.post('/transactions/send', (req, res) => {
    let transaction = new Transaction(req.body.from,
                                     req.body.to,
                                    req.body.amount);

    let message = MLTransactionManager.addNewTransaction(transaction);

    // Make a request to every node to add transaction
    for(let x = 0; x < Node.nodes.length; x++){
        const networkURL = Node.nodes[x];
        console.log(networkURL + " Transactions was successfully sync.");
        axios.post(`${networkURL}/transactions/send/broadcast`, {transaction: transaction})
             .then(function(){}).catch(function(){});
    }

    res.send({message: message, Node: Node.nodes.length});
});

app.post('/transactions/send/broadcast', (req, res) => {
    let transaction = req.body.transaction;
    let message = MLTransactionManager.addNewTransaction(transaction);
    console.log("Transaction data sync... " + message);
});

// ============================ Block Explorer API =========================

app.get('/balances', (req, res) => {
    res.send(JSON.stringify(MLTransactionManager.getBalance()));
});

app.get('/transaction/address/:address', (req, res) => {
    res.send(JSON.stringify(MLTransactionManager.getTransactionByAddress(req.params.address)));
});

app.get('/balance/address/:address', (req, res) => {
    res.send(JSON.stringify(MLTransactionManager.getBalanceByAddress(req.params.address)));
});

// ============================ Mining API ===================================

app.get('/mining/getjobs/:address', (req, res) => {
    let latestBlock = MagicLedger.getLatestBlock();
    let minerAddress = req.params.address;
    let nextIndex = latestBlock.index + 1;

    let blockDataHash = {
        index: nextIndex,
        transactions: MLTransactionManager.getPendingTransactions(),
        difficulty: MagicLedger.currentDifficulty,
        previousHash: latestBlock.blockHash,
        minedBy: minerAddress
    }

    let expectedBlock = {
        index: nextIndex,
        transactionsIncluded: MLTransactionManager.getPendingTransactions().length,
        transactions: MLTransactionManager.getPendingTransactions(),
        difficulty: MagicLedger.currentDifficulty,
        expectedReward: 50,
        rewardAddress: minerAddress,
        previousHash: latestBlock.blockHash,
        blockDataHash: utils.SHA256(JSON.stringify(blockDataHash))
    }

    res.send(JSON.stringify(expectedBlock));
});

app.post('/mining/submit-block', (req, res) => {
    // PROCESS MINER
    let previousBlock = MagicLedger.getLatestBlock();
    let blockDataHash = req.body.blockDataHash;
    let block = req.body.block;
    let transactions = req.body.transactions;

    let DataHash = {
        index: block.index,
        transactions: transactions,
        difficulty: block.difficulty,
        previousHash: block.previousHash,
        minedBy: block.minedBy
    }

    let expectedBlockDataHash = utils.SHA256(JSON.stringify(DataHash));

    let data = `${blockDataHash}|${block.dateCreated}|${block.nonce}`;
    let ProperData = utils.SHA256(data);

    // if incorrect hash
    if(block.blockHash !== ProperData || blockDataHash !== expectedBlockDataHash){
        res.send({errorMSG: "Block hash is incorrectly calculated."});
    }else if(previousBlock.blockHash === block.blockHash){
        res.send({errorMSG: "Block not found or was already mined."});
    }else{
        MagicLedger.addBlock(block);
        MLTransactionManager.clearPendingTransactions();
        res.send({message: "Block accepted. Mining was successfull"});
    }

});

app.post('/block/broadcast', (req, res) => {
    let block = req.body.block;
    MagicLedger.addBlock(block);
    MLTransactionManager.clearPendingTransactions();
    console.log("Blocks was successfully sync.");
});

app.post('/debug/mine', (req, ress) => {

    let minerAddress = req.body.minerAddress;
    axios.get(Node.networkUrl + '/mining/getjobs/' + minerAddress)
    .then(function(res){
        previosBlock = res.data;
        //console.log(res.data)
        var nonce = 0;
        var nextTimeStamp = new Date().getTime() / 1000;
        var nextHash = hashData(previosBlock.blockDataHash, nextTimeStamp,nonce);
        var difficulty = previosBlock.difficulty;

        var nextIndex = previosBlock.index;
        while(nextHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
        nonce++;
        nextTimeStamp = new Date().toISOString();
        nextHash = hashData(previosBlock.blockDataHash, nextTimeStamp,nonce);

        console.log(" Nonce: " + nonce + " Hash: " + nextHash);
        }

    let block = new Block(nextIndex,nextHash,previosBlock.previousHash,previosBlock.rewardAddress,nextTimeStamp,difficulty,nonce,previosBlock.transactions);
    
    let nextBlock = {
        "transactions": previosBlock.transactions,
        "blockDataHash": previosBlock.blockDataHash,
        "block": block
    }

    axios.post(Node.networkUrl + "/mining/submit-block", nextBlock)
    .then(function(result){
        ress.json({message: "New block has been mined!"});
        let thisShit = Node.blockchain.calculateRewards();
        console.log(thisShit);
        console.log(result.data);

        // Make a request to every node to add transaction
        for(let x = 0; x < Node.nodes.length; x++){
            const networkURL = Node.nodes[x];
            console.log(networkURL + " Transactions was successfully sync.");
            axios.post(`${networkURL}/block/broadcast`, {block: block})
                .then(function(){}).catch(function(){});
        }

    })
    .catch((err)=>{
        console.log(err);
    })
    
    });

});

function hashData(blockhash, timestamp, nonce){
    let data = `${blockhash}|${timestamp}|${nonce}`; 
    return utils.SHA256(data);
}

// ============================ NODES API =====================================

app.get('/nodes', (req, res) => {

});

app.post('/connect-node', (req, res) => {
    // Get the node that wants to connect
    const connectionNodeUrl = req.body.nodeUrl;

    // Add node to nodes array if not present
    if(Node.nodes.indexOf(connectionNodeUrl) == -1) Node.nodes.push(connectionNodeUrl);

    // Make a request to every node to register the new node
    for(let x = 0; x < Node.nodes.length; x++){
        const networkURL = Node.nodes[x];
        axios.post(`${networkURL}/broadcast-node`, {nodeUrl: connectionNodeUrl})
             .then(function(){}).catch(function(){});
    }

    // Register existing nodes to the connecting node
    axios.post(`${connectionNodeUrl}/register-nodes`,{
        networks: [...Node.nodes, Node.networkUrl]
    })
    .then(function(){

        // SYNC NODE CHAIN BLOCKS AND TRANSACTIONS
        axios.get(`${connectionNodeUrl}/info`)
        .then(function(result){
            let connectingNodeInfo = result.data;
            
            let connectingDifficulty = connectingNodeInfo.cumulativeDifficulty;
            let currentDiffuculty = Node.blockchain.cumulativeDifficulty();

            if(connectingDifficulty > currentDiffuculty){
                axios.get(`${connectionNodeUrl}/blocks`)
                     .then(function(res){
                        Node.blockchain.updateChain(res.data);
                        console.log("[Synchronization]","Discarded current chain. Peer chain is much longer.");

                        for(let x = 0; x < Node.nodes.length; x++){
                            const networkURL = Node.nodes[x];
                            if(networkURL !== connectionNodeUrl){
                            axios.post(`${networkURL}/sync-chain`, {blocks: Node.blockchain.chain})
                                 .then(function(){}).catch(function(){});
                            }
                        }

                     });
            }else if(connectingDifficulty < currentDiffuculty){
                axios.post(`${connectionNodeUrl}/sync-chain`, {blocks: Node.blockchain.chain})
                     .then(function(){}).catch(function(){});
            }

        })
        .catch(function(err){
            console.log("Error: ", err);
        });

        res.send(`Node ${connectionNodeUrl} was added to the network.`);
        console.log("[Register]",`Node ${connectionNodeUrl} was added to the network.`);
    });

});

app.post('/sync-chain', (req, res) => {
    Node.blockchain.updateChain(req.body.blocks);
    console.log("[Synchronization]","Discarded current chain. Peer chain is much longer.");
});

app.post('/broadcast-node', (req, res) => {
    const connectionNodeUrl = req.body.nodeUrl;
    if(!Node.nodeHash(connectionNodeUrl) && !Node.isCurrentNode(connectionNodeUrl)) Node.nodes.push(connectionNodeUrl);
    console.log("[Register]",'Added Nodes to this network');
    //res.send("New node was registered successfully");
});

app.post('/register-nodes', (req, res) => {
    const networks = req.body.networks;

    for(let x = 0; x < networks.length; x++){
        let nodeUrl = networks[x];
        if(!Node.nodeHash(nodeUrl) && !Node.isCurrentNode(nodeUrl)) Node.nodes.push(nodeUrl);
    }

    res.send("You are now successfully part of the network.");
});

// Start server
app.listen(Node.port,Node.host, () => {
    console.log(`Server is running at: ${Node.networkUrl}`);
});






