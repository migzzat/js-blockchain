const port = process.argv[2];
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain.js');
const uuid = require('uuid/v1');
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/blockchain', function (req, res) {
       res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const index = bitcoin.addTransactionToPendingTransactions(newTransaction);
 
    res.json({note : `Transaction will added in block ${ index }.`});
});

app.post('/transaction/broadcast', function (req, res) {
	  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);

    let promisesReq = [];
    bitcoin.networkNodes.forEach((nodeUrl) => {
        const reqOpt = {
            uri: `${ nodeUrl }/transaction`,
            method: 'POST',
            body: newTransaction,
            json: true
        };

        promisesReq.push(rp(reqOpt));
    });

    Promise.all(promisesReq)
           .then(data => {
               res.json({note : `Transaction created and broadcast succefully.`});
           }).catch(error => {
               res.json({note : `Something bad happened.`, error,});
           });
});

app.get('/mine', function (req, res) {
       // create new block
       const lastBlock = bitcoin.getLastBlock();
       const previousBlockHash = lastBlock['hash'];

       const currentBlockData = {
       	   index: lastBlock['index'] +1,
       	   transactions: bitcoin.pendingTransactions
       };

       const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

       const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

       bitcoin.createNewTransaction(12.5, "00", nodeAddress);

       const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
       
       let promisesReq = [];
       bitcoin.networkNodes.forEach((nodeUrl) => {
           const reqOpt = {
              uri: `${ nodeUrl }/receive-new-block`,
              method: 'POST',
              body: {newBlock: newBlock},
              json: true
           };

           promisesReq.push(rp(reqOpt));
       });

       Promise.all(promisesReq)
       .then(data => {
           const requestOption = {
             uri: `${ bitcoin.currentNodeUrl }/transaction/broadcast`,
             method: 'POST',
             body: {
               amount: 12.5,
               sender: '00',
               recipient: nodeAddress
             },
             json: true
           };
           
           return rp(requestOption);
       }).then(data => {
        res.json({
          note: "new block mined and broadcast successfully.",
          block: newBlock
        });
       });
});

app.post('/receive-new-block', function(req, res,) {
     const newBlock = req.body.newBlock;
     const lastBlock = bitcoin.getLastBlock();
     const correctHash = lastBlock.hash === newBlock.previousBlockHash;
     const correctIndex = lastBlock.index +1 === newBlock.index;

     if (correctHash && correctIndex) {
         bitcoin.chain.push(newBlock);
         bitcoin.pendingTransactions = [];
         res.json({
          note: "new block received and accepted.",
          block: newBlock
        });
     } else {
        res.json({
          note: "new block rejected.",
          block: newBlock
        });
     }
});

// register a node and broadcast it in the network
app.post('/register-and-broadcast-node', function(req, res) {
   console.log(req.body.newNodeUrl)
   const newNodeUrl = req.body.newNodeUrl;
   console.log(newNodeUrl)
   if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) 
   	    bitcoin.networkNodes.push(newNodeUrl);
   
   const regNodesPromises = [];

   bitcoin.networkNodes.forEach((networkNodeUrl, index, array) => {
      
      const requestOption = {
      	uri: `${ networkNodeUrl }/register-node`,
      	method: 'POST',
      	body: { newNodeUrl: newNodeUrl },
      	json: true
      };

      regNodesPromises.push(rp(requestOption));

   });
   
   Promise.all(regNodesPromises)
   .then(data => {
         const bulkRegisterOptions = {
             uri: `${ newNodeUrl }/register-nodes-bulk`,
            method: 'POST',
            body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ]},
            json: true
         };

         return rp(bulkRegisterOptions);
   }).then(data => {
        res.json({ note: 'New node registered with network successfully.' });
   });

});

// register a node with the network
app.post('/register-node', function(req, res) {
  console.log(req.body.newNodeUrl)
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const isNotCurrentNodeUrl = bitcoin.currentNodeUrl !== newNodeUrl;

  if( nodeNotAlreadyPresent && isNotCurrentNodeUrl ) 
    bitcoin.networkNodes.push(newNodeUrl);

  res.json({ note: 'New node registered successfully.' });

});

// register mutiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
  console.log(req.body.allNetworkNodes)
  const allNetworkNodes = req.body.allNetworkNodes;
  
  allNetworkNodes.forEach((networkNodeUrl, index, array) => {
      const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
      const isNotCurrentNodeUrl = bitcoin.currentNodeUrl !== networkNodeUrl;

        if( nodeNotAlreadyPresent && isNotCurrentNodeUrl ) 
          bitcoin.networkNodes.push(networkNodeUrl);

        if(index == array.length -1) {
          res.json({ note: 'Bulk registtation successful.' });
        }
  });
});

app.get('/consensus', function(req, res) {
    
    let promisesRequests = [];
    bitcoin.networkNodes.forEach((nodeNetworkUrl) => {
        const reqOpt = {
            uri: `${ nodeNetworkUrl }/blockchain`,
            method: 'GET',
            json: true
        };
        promisesRequests.push(rp(reqOpt));
    });

    Promise.all(promisesRequests)
    .then(blockchains => {

        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach((blockchain) => {
              if(blockchain.chain.length > maxChainLength){
                  maxChainLength = blockchain.chain.length;
                  newLongestChain = blockchain.chain;
                  newPendingTransactions = blockchain.pendingTransactions;
              }
        });

        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
               res.json({
                  note: 'current chain has not been replaced.',
                  chain: bitcoin.chain
               });
        } else {
              
              bitcoin.chain = newLongestChain;
              bitcoin.pendingTransactions = newPendingTransactions;

              res.json({
                note: 'current chain has not been replaced.',
                chain: bitcoin.chain
              });
        }
        
    });
});

app.listen(port, function () { console.log(`listening on port [:${port}]...`) });