const CassandraAPI = require('../middleware/cassandraAPI');

const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected");
      clearInterval(checkConnected);
      let promises = [];

      promises.push(client.insertEnergyUsage("UtSosJFSKVQMvHaDncLM3YxF", makePowerInserts(10000000)));
      // promises.push(client.insertPowerUsage1("UtSosJFSKVQMvHaDncLM3YxF", makeEnergyInserts(1000)));

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


function makeEnergyInserts(index) {
  let data = [];
  let time = new Date().valueOf() - 1000*60*60*24*7;
  let kWh = 0;
  for (let i = 0; i < index; i++) {
    kWh += Math.random() ;
    time += Math.floor(1000 * Math.random());
    data.push({time: time.valueOf(), value: {kWh: kWh}})
  }
  return data
}


function makePowerInserts(index) {
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