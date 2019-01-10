const CassandraAPI = require('../middleware/cassandraAPI');

const client = new CassandraAPI();
client.connect();

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
