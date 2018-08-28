function MiningManager(transactionManager){
    this.transactionManager = transactionManager;
    this.blockchain = this.transactionManager.blockchain;
}

MiningManager.prototype.getMiningJobs = function(){

}