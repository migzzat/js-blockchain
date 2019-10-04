
const Blockchain = require('./blockchain.js')

const bitcoin = new Blockchain();


let bc1 = {
"chain": [
{
"index": 1,
"timestamp": 1570202244826,
"transactions": [],
"nonce": 100,
"hash": "0",
"previousBlockHash": "0"
},
{
"index": 2,
"timestamp": 1570202257960,
"transactions": [],
"nonce": 5672,
"hash": "00002b62f1205be4a02b5f13b07344e7dbbe80088ec44327c34971412405da12",
"previousBlockHash": "0"
},
{
"index": 3,
"timestamp": 1570202285906,
"transactions": [
{
"transactionId": "19a1cb10e6ba11e9bd98ed3f605edc56",
"amount": 12.5,
"sender": "00",
"recipient": "11c9e3a0e6ba11e9bd98ed3f605edc56"
},
{
"transactionId": "1e8d6800e6ba11e9bd98ed3f605edc56",
"amount": "70",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
},
{
"transactionId": "205a86e0e6ba11e9bd98ed3f605edc56",
"amount": "700",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
},
{
"transactionId": "23c8d2a0e6ba11e9bd98ed3f605edc56",
"amount": "20",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
},
{
"transactionId": "27962e50e6ba11e9bd98ed3f605edc56",
"amount": "230",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
}
],
"nonce": 64075,
"hash": "0000a7e75c3d2185a0352e1585181b417953d217ae770e39e37b5864cea3f13a",
"previousBlockHash": "00002b62f1205be4a02b5f13b07344e7dbbe80088ec44327c34971412405da12"
},
{
"index": 4,
"timestamp": 1570202307845,
"transactions": [
{
"transactionId": "2a46f670e6ba11e9bd98ed3f605edc56",
"amount": 12.5,
"sender": "00",
"recipient": "11c9e3a0e6ba11e9bd98ed3f605edc56"
},
{
"transactionId": "2eca34a0e6ba11e9bd98ed3f605edc56",
"amount": "20",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
},
{
"transactionId": "318cfe20e6ba11e9bd98ed3f605edc56",
"amount": "150",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
},
{
"transactionId": "3459d9c0e6ba11e9bd98ed3f605edc56",
"amount": "500",
"sender": "MIGZZMNASDFKLHG54SKFNAS",
"recipient": "SENDERMNASDFKLHG54SKFNAS"
}
],
"nonce": 176928,
"hash": "0000b000bee37dce2db805cb67be63193d93ba686570204a2d37ff87ab100d66",
"previousBlockHash": "0000a7e75c3d2185a0352e1585181b417953d217ae770e39e37b5864cea3f13a"
}
],
"pendingTransactions": [
{
"transactionId": "3759fa60e6ba11e9bd98ed3f605edc56",
"amount": 12.5,
"sender": "00",
"recipient": "11c9e3a0e6ba11e9bd98ed3f605edc56"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
}; 

console.log('VALID : ',bitcoin.chainIsValid(bc1.chain));