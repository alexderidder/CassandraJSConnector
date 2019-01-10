let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";


let data = [];
let time = new Date().valueOf() - 1000 * 60 * 60 * 24 * 7;
let kWh = 0;
let test =  "test5";

for (let i = 0; i < 1000000; i++) {
  kWh += Math.random();
  time += Math.floor(1000 * Math.random());
  data.push({id: test, time: time.valueOf(), value: kWh})
}

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   let dbo = db.db("mydb");
//   let query = data;
//   let time = new Date().getTime();
//   // dbo.collection("customers").createIndex({ id : 1})
//   dbo.collection("customers").insertMany(query, function(err, res) {
//     if (err) throw err;
//     console.log("Number of documents inserted: " + res.insertedCount);
//     console.log(new Date().getTime() - time);
//     db.close();
//   });
// });
//

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var query = { id: test};
let time = new Date().getTime();
  dbo.collection("customers").find(query).toArray(function(err, result) {
    if (err) throw err;
    // console.log(result);
console.log(new Date().getTime() - time);
    db.close();
  });
});
