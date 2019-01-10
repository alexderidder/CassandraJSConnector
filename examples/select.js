const CassandraAPI = require('../middleware/cassandraAPI');


const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected");
      clearInterval(checkConnected);
      let promises = [];
      promises.push(client.getEnergyUsage1(["UtSosJFSKVQMvHaDncLM3YxF"], new Date().getTime()+ 500000000000000, new Date().getTime() + 500000000000000 ));
      // promises.push(client.getPowerUsage(["UtSosJFSKVQMvHaDncLM3YxF"]));
      let time = new Date().getTime();
      Promise.all(promises).then((data) => {
        let a = JSON.parse(data);
        console.log(a["stones"]["UtSosJFSKVQMvHaDncLM3YxF"]);
        console.log(new Date().getTime() - time)
        client.close();
      }).catch((error) => {
          console.log(error);
          client.close();
        }
      );


    }
  }
  , 1000);
