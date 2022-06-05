import { Block } from "./block.js";
import { Transaction } from "./transaction.js";

import nodePersist from 'node-persist';
import crypto from 'crypto'

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);



class Blockchain {
  constructor() {
    // this.blocks = [this.createGenesisBlock()];
    this.blocks = [];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;


    (async () => {
      this.storage = nodePersist.create({
        dir: __dirname + '/../../storage/' + crypto.createHash('md5').update('').digest("hex")
      });
      await this.storage.init();

      let blocks = await this.storage.getItem('blocks');

      this.blocks = typeof blocks != 'undefined' ? blocks : [];

      if (this.blocks.length == 0) {
        let genesisBlock = this.createGenesisBlock(); // initial block
        this.addBlock(genesisBlock);
      }
    })();

  }


  addBlock(block) {
    if (this.blocks.length == 0) {
      block.previousHash = "0000000000000000";
      block.hash = block.calculateHash(); 
    }

    block.number = this.blocks.length
    this.blocks.push(block);
    this._updateBlockStorage()

  }

  updateBlocks (blocks) {
    this.blocks = blocks;
    this._updateBlockStorage()

  }


  async _updateBlockStorage(){
    await this.storage.setItem('blocks', this.blocks)
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(Date.now(), [], '0', 0);
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   *
   * @param {string} miningRewardAddress
   */
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.blocks.push(block);
    this._updateBlockStorage()

    this.pendingTransactions = [];
    return block
  }

  /**
   * Add a new transaction to the list of pending transactions (to be added
   * next time the mining process starts). This verifies that the given
   * transaction is properly signed.
   *
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw 'Transaction must include from and to address'
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw 'Cannot add invalid transaction to chain'
    }

    if (transaction.amount <= 0) {
      throw 'Transaction amount should be higher than 0'
    }

    // Making sure that the amount sent is not greater than existing balance
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
    if (walletBalance < transaction.amount) {
      throw 'Not enough balance'
    }

    // Get all other pending transactions for the "from" wallet
    const pendingTxForWallet = this.pendingTransactions
      .filter(tx => tx.fromAddress === transaction.fromAddress);

    // If the wallet has more pending transactions, calculate the total amount
    // of spend coins so far. If this exceeds the balance, we refuse to add this
    // transaction.
    if (pendingTxForWallet.length > 0) {
      const totalPendingAmount = pendingTxForWallet
        .map(tx => tx.amount)
        .reduce((prev, curr) => prev + curr);

      const totalAmount = totalPendingAmount + transaction.amount;
      if (totalAmount > walletBalance) {
        throw 'Pending transactions for this wallet is higher than its balance.'
      }
    }


    this.pendingTransactions.push(transaction);
  }

  /**
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.blocks) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  /**
   * Returns a list of all transactions that happened
   * to and from the given wallet address.
   *
   * @param  {string} address
   * @return {Transaction[]}
   */
  getAllTransactionsForWallet(address) {
    const txs = [];

    for (const block of this.blocks) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    return txs;
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.blocks[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      if (previousBlock.hash !== currentBlock.previousHash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }
}

export { Blockchain }