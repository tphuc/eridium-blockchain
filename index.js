import express from 'express';
import bodyParser from 'body-parser'
import { Controller } from './src/controller/blockchainController.js';



// Load env vars
const url = process.env.URL || 'localhost';
const port = process.env.PORT || 4000;

// Init express
let app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let listener = app.listen(port, url, function() {
    console.log('Server started at ' + listener.address().address + ':' + listener.address().port);
});

let controller = new Controller()

app.post('/transaction', controller.postTransaction.bind(controller));
app.get('/transactions', controller.getTransactions.bind(controller));
app.post('/mine', controller.mine.bind(controller));
app.get('/blockchain', controller.getBlockchain.bind(controller));
app.get('/blockchain/:id', controller.getBlockById.bind(controller));
