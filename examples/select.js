const CassandraAPI = require('../middleware/cassandraAPI');


const client = new CassandraAPI();
client.connect();

let checkConnected = setInterval(() => {
        if (client.isConnected()) {
            console.log("Client connected");
            clearInterval(checkConnected);
            let promises = [];

            promises.push(client.getEnergyUsage1(["test"], 1549274006010, 1559274006010));
            let time = new Date().getTime();
            Promise.all(promises).then((data) => {

                let a = JSON.parse(data);
                if( a["stones"]["test"] != null){
                    console.log(a["stones"]["test"]);
                }else{
                    console.log(a["stones"]);
                }
                console.log("Took in ms:", new Date().getTime() - time);
                client.close();
            }).catch((error) => {
                    console.log(error);
                    client.close();
                }
            );


        }
    }
    , 1000);
