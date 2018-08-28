const Transaction = require('./transaction');
const commonUtils = require('../utility/common');

function TransactionManager(Blockchain){
    this.Blockchain = Blockchain;
}

TransactionManager.prototype.addNewTransaction = function(transaction){
    this.Blockchain.pending_transactions.push(transaction);
    return "Transaction was successfull";
}

TransactionManager.prototype.addNewCoinBaseTransaction = function(){
    const coinBaseTransaction = new Transaction(
    );
}

TransactionManager.prototype.clearPendingTransactions = function(){
    this.Blockchain.pending_transactions = [];
}

TransactionManager.prototype.getPendingTransactions = function(){
    return this.Blockchain.pending_transactions;
}

TransactionManager.prototype.getBlockTransactions = function(){
    let transactions = [];
    this.Blockchain.chain.forEach((blocks) => {
        if(blocks.transactions.length > 0){
            transactions.push.apply(transactions, blocks.transactions);
        }
    });
    return transactions;
}

TransactionManager.prototype.getAllTransactions = function(){
    let transactions = this.getBlockTransactions();
    let pending_transactions = this.getPendingTransactions();
    transactions.push.apply(transactions, pending_transactions);
    return transactions;
}

TransactionManager.prototype.getTransactionByAddress = function(address){
    let confirmedTransaction = this.getBlockTransactions();
    let transactions = [];

    confirmedTransaction.forEach((transaction) => {
        if(transaction.to === address || transaction.from === address){
            transactions.push(transaction);
        }
    });

    return transactions;
}

TransactionManager.prototype.getTransactionsByHash = function(transHash){
    let transactions = this.getAllTransactions().filter(t => t.transactionDataHash === transHash);
    if(transactions.length > 0) return transactions[0];
    return undefined;
}

TransactionManager.prototype.getTransactionHistory = function(address){
    if(!commonUtils.validateAddress(address)) return { err: "Invalid address format"};
    return this.getAllTransactions()
               .filter(t => t.from === address || t.to === address)
               .sort((a,b) => a.dateCreated.localeCompare(b.dateCreated));
}

TransactionManager.prototype.getBalanceByAddress = function(address){
    /*if(!commonUtils.validateAddress(address)) return {err: "Invalid message"};
    let transactions = this.getTransactionHistory(address);
    let balance = {"safeBalance": 0, "confirmedBalance":0, "pendingBalance":0};

    for(let x = 0; x < transactions.length; x++){
        let 
    }*/
    
    let confirmedTransactions = this.getBlockTransactions();
    let balance = 0;
    confirmedTransactions.forEach((transaction) => {
        if(transaction.from === address){
            balance -= parseInt(transaction.amount);
        }else if(transaction.to === address){
            balance += parseInt(transaction.amount);
        }
    });
    
    return balance;
}

TransactionManager.prototype.getBalance = function(){
    let confirmedTransactions = this.getBlockTransactions();
    let accounts = [];
    let balanceSheet = {};
    let balances = [];

    confirmedTransactions.forEach((transaction) => {
        if(accounts.indexOf(transaction.from) < 0){
            accounts.push(transaction.from);
        }
        if(accounts.indexOf(transaction.to) < 0){
            accounts.push(transaction.to);
        }
    });

    accounts.forEach((address) => {
        balanceSheet[address] = this.getBalanceByAddress(address);
    });

    return balanceSheet;
}

module.exports = TransactionManager;