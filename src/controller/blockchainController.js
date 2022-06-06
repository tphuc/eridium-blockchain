import { Blockchain } from "../model/blockchain.js";
import { Transaction } from "../model/transaction.js";



export class Controller {


    constructor() {
        this.blockchain = new Blockchain();
    }


    postTransaction(req, res) {
        try {
            const { from, to, amount, sign } = req.body;
            let tx = new Transaction(from, to, amount);
            tx.signTransaction(sign)
            this.blockchain.addTransaction(tx)
            res.json({ message: 'Add transaction success' })
        }
        catch (error) {
            res.status(406)
            res.json({ error })
        }
    }



    getTransactions(req, res) {
        let transactions = this.blockchain.blocks.filter(item => item.transactions?.length).reduce(
            (prev, current) => [...prev, ...current.transactions],
            []
          );
        res.json([...transactions, ...this.blockchain.pendingTransactions])
    }


    getTransactionByHash(req, res){
        let { hash } = req.params
        let transactions = this.blockchain.blocks.filter(item => item.transactions?.length).reduce(
            (prev, current) => [...prev, ...current.transactions],
            []
        );
        let transaction = [...transactions, ...this.blockchain.pendingTransactions].find(item => item?.hash == hash)
        res.json(transaction)
    }


    mine(req, res) {
        let { address } = req.body;
        res.json(this.blockchain.minePendingTransactions(address))
    }


    getBlockchain(req, res) {
        let blocks = this.blockchain.blocks.map(item => 
            ({
                ...item,
                miningData: item?.transactions?.length ? item?.transactions[item?.transactions.length - 1] : null
            })
        )
        res.json(blocks)
    }

    getBlockById(req, res) {
        let id = req.params.id
        let blocks = this.blockchain.blocks.map(item => 
            ({
                ...item,
                miningData: item?.transactions?.length ? item?.transactions[item?.transactions.length - 1] : null
            })
        )
        try {
            let block = blocks[id]
            res.json(block)
        }
        catch(e){
            res.status = 404
            res.json({message:"not found"})
        }
        
        
    }


    getWalletTransac(req, res){
        let address = req.params.address || req.query.address
        res.json(this.blockchain.getAllTransactionsForWallet(address))   
    }

    getWalletBalance(req, res){
        let address = req.params.address || req.query.address
        res.json(this.blockchain.getBalanceOfAddress(address))   
    }






}


