const CassandraAPI = require('../middleware/cassandraAPI');

const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
    if (client.isConnected()) {
      console.log("Client connected");
      clearInterval(checkConnected);
      let time = new Date().getTime();
      client.deleteEnergyUsage("test", 1549274006010, 1559274006010).then((data) => {
        console.log("Took in ms:" ,new Date().getTime() - time);
        console.log(data);
        client.close();
      }).catch((error) => {
        console.log(error);
        client.close();
      });
    }
  }
  , 1000)
