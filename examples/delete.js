const fs = require('fs');
const CassandraAPI = require('../middleware/cassandraAPI');
let options = {
  ca: [fs.readFileSync('./keys/ca-crt.pem')],
  key: fs.readFileSync('./keys/client1-key.pem'),
  cert: fs.readFileSync('./keys/client1-crt.pem'),
  host: 'localhost',
  port: 12345,
  rejectUnauthorized: true,
  requestCert: true
};


const client = new CassandraAPI();
client.connect(options);

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected");
      clearInterval(checkConnected)
      client.deleteAllUsageData(["UtSosJFSKVQMvHaDncLM3YxF"]).then((data) => {
        console.log(data);
        client.close();
      }).catch((error) => {
        console.log(error);
        client.close();
      });
    }
  }
  , 1000)
