// const fs = require('fs');
const CassandraAPI = require('../middleware/cassandraAPI');


// let options = {
//   ca: [fs.readFileSync('./keys/ca-crt.pem')],
//   key: fs.readFileSync('./keys/client1-key.pem'),
//   cert: fs.readFileSync('./keys/client1-crt.pem'),
//   host: 'localhost',
//   port: 12345,
//   rejectUnauthorized: true,
//   requestCert: true
// };
//

const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected");
      client.close();
      clearInterval(checkConnected)
    }
  }
  , 1000);
