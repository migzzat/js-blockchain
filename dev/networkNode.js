const port = process.argv[2];
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain.js');
const uuid = require('uuid/v1');

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/blockchain', function (req, res) {
       res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
	const index = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({note : `Transaction will added in block ${ index }.`});
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

       res.json({
       	    note: "new block mined successfully.",
       	    block: newBlock
       });
});

// register a node and broadcast it in the network
app.post('/register-and-broadcast', function(req, res) {
   
   const newNodeUrl = req.body.newNodeUrl;

   if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) 
   	    bitcoin.networkNodes.push(newNodeUrl);
   
   const regNodesPromises = [];

   bitcoin.networkNodes.forEach((networkNodeUrl, index, array) => {
      
      const requestOption = {
      	uri: `${ newNodeUrl }/register-node`,
      	method: 'POST',
      	body: { newNodeUrl: newNodeUrl },
      	json: true
      };

      regNodesPromises.push(rp(requestOption));
      
      if(index == array.length -1) {
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
      }

   });	

});

// register a node with the network
app.post('/register-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const isNotCurrentNodeUrl = bitcoin.currentNodeUrl !== newNodeUrl;

  if( nodeNotAlreadyPresent && isNotCurrentNodeUrl ) 
    bitcoin.networkNodes.push(newNodeUrl);

  res.json({ note: 'New node registered successfully.' });

});

// register mutiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  
  allNetworkNodes.forEach((networkNodeUrl, index, array) => {
      const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
      const isNotCurrentNodeUrl = bitcoin.currentNodeUrl !== networkNodeUrl;

        if( nodeNotAlreadyPresent && isNotCurrentNodeUrl ) 
          bitcoin.networkNodes.push(newNodeUrl);

        if(index == array.length -1) {
          res.json({ note: 'Bulk registtation successful.' });
        }
  });
});


app.listen(port, function () { console.log(`listening on port [:${port}]...`) });