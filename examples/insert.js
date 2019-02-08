const CassandraAPI = require('../middleware/cassandraAPI');

const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected"
      );
      clearInterval(checkConnected);
      let promises = [];

      promises.push(client.insertEnergyUsage("test", makeEnergyInserts(10000)));
      let time = new Date().getTime();
      Promise.all(promises).then((data) => {
        console.log(data);
        client.close();
        console.log("Took in ms:", new Date().getTime() - time)
      }).catch((error) => {
        console.log(error);
        client.close();
      });
    }
  }
  , 1000);


function makeEnergyInserts(index) {
  let data = [];
  let time = 1549274006010 ;
  let kWh = 0;
  for (let i = 0; i < index; i++) {
    kWh += Math.random() ;
    time += 1000;

    data.push({time: time.valueOf(), value: {kWh: kWh}})
  }
  return data
}


function makePowerInserts(index) {
  let data = [];
  let time = 1549274006010;
  for (let i = 0; i < index; i++) {
    time += 1000;
    data.push({time: time.valueOf(), value: {pf: Math.random() * 2 - 1, watt: Math.random() * 3600}})
  }
  return data
}