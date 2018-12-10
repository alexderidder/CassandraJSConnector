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
      clearInterval(checkConnected);
      let promises = [];
      promises.push(client.insertPowerUsage("UtSosJFSKVQMvHaDncLM3YxF", makePowerInserts(1000)));
      promises.push(client.insertEnergyUsage("UtSosJFSKVQMvHaDncLM3YxF", makeEnergyInserts(1000)));

      Promise.all(promises).then((data) => {
        console.log(data);
        client.close();

      }).catch((error) => {
        console.log(error);
        client.close();
      });
    }
  }
  , 1000);


function makePowerInserts(index) {
  let data = [];
  let time = new Date().valueOf();
  let kWh = 0;
  for (let i = 0; i < index; i++) {
    kWh += Math.random() * 0.1;
    time += 5;
    data.push({time: time.valueOf(), value: {kWh: kWh}})
  }
  return data
}


function makeEnergyInserts(index) {
  let data = [];
  let time = new Date().valueOf();
  let kWh = 0;
  for (let i = 0; i < index; i++) {
    kWh += Math.random() * 0.1;
    time += 5;
    data.push({time: time.valueOf(), value: {pf: Math.random() * 2 - 1, watt: Math.random() * 3600}})
  }
  return data
}