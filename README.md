# Cassandra JS-connector

TLS client to talk with the Cassandra server

## Installation

```
npm install
```

## Usage

You can run the examples in the ./examples folder using:
```
node connect.js
```

## API

You import the library using require.
``` javascript
// import library
let CassandraAPI = require("../middleware/cassandraAPI")

// create a CassandraAPI instance
const client = new CassandraAPI();

// connect
client.connect(options);
```

CassandraAPI has a number of methods available:

***`getPowerUsage(options)`***
> @param **options** : [TLS Server options documentation](https://nodejs.org/api/tls.html#tls_new_tls_tlssocket_socket_options "TLSServer Documentation")
> ``` js 
> options = {
>   ca: [buffer],
>   key: buffer,
>   cert: buffer,
>   host: string,
>   port: number,
>   rejectUnauthorized: boolean,
>   requestCert: boolean
> }
> ```
> @returns void  

### Select
***`getPowerUsage(stoneIds = [string], beginTime = timestamp, endTime = timestamp)`***
> @param **stoneIds** *: array of strings; ‘12-byte ‘MongoDB ObjectID'*  
> @param **beginTime** *: number; forms a range with endtime;  format emitted by javascripts new Date().toValue()*  
> @param **endTime** *: number; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*  
> @returns **Promise<data>** *: data json object*
> ```js
> {
>   "startTime": timestamp, //optional
>   "endTime": timestamp, //optional
>   "interval": number , //optional
>   "stones":[
>      {
>         "stoneID": string,
>         "Data":[
>            {
>               "time": timestamp,
>               "value":
>                  {
>                     "kWh" : number
>                  }
>            },
>            {
>               "time": timestamp,
>               "value":
>                  {
>                     "kWh" : number
>                  }
>            }
>         ]
>      }
>   ]
>}
>```


***`getEnergyUsage(stoneIds = [string], beginTime =  timestamp, endTime = timestamp)`***
> @param **stoneIds** *: array of strings; ‘12-byte ‘MongoDB ObjectID'*  
> @param **beginTime** *: number; forms a range with endtime;  format emitted by javascripts new Date().toValue()*  
> @param **endTime** *: number; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*  
> @returns **Promise<data>** *: data json object*  
>```js
> {
>   "startTime": timestamp, //optional
>   "endTime": timestamp, //optional
>   "interval": number, //optional
>   "stones":[
>      {
>         "stoneID": string,
>         "Data":[
>            {
>               "time": timestamp,
>               "value":
>                 {
>                    "w": number,
>                    "pf": number
>                 }
>            },
>            {
>               "time": timestamp,
>               "value":
>                 {
>                    "w": number,
>                    "pf": number
>                 }
>            }
>         ]
>      }
>   ]
>}
>```

## Delete

***`deletePowerUsage(stoneId = string , beginTime = timestamp, endTime = timestamp)`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*  
> @param **beginTime** *: number; forms a range with endtime;  format emitted by javascripts new Date().toValue()*  
> @param **endTime** *: number; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*  
> @returns **Promise<data>** *: json: number of successful deletions*    
>```js
> {
>	 "deleted": number
>}
>```

***`deleteEnergyUsage(stoneId = string , beginTime = timestamp, endTime = timestamp)`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*  
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*  
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*  
> @returns **Promise<data>** *: json: number of successful deletions*  
>```js 
> {
>	 "deleted": number
>}
>```

***`deleteAllUsageData(stoneId =  string , beginTime = timestamp, endTime = timestamp)`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*  
> @param **beginTime** *: number; forms a range with endtime;  format emitted by javascripts new Date().toValue()*  
> @param **endTime** *: number; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*  
> @returns **Promise<data>** *: json: number of successful deletions*  
>```js
> {
>	 "deleted": number
>}
>```

***`insertEnergyUsage(stoneId = string, data = array of timeAndEnergy)`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*  
> @param **data** *: array of timeAndEnergy; {time = timestamp, w = number, pf = number }; number;format emitted by javascripts new Date().toValue() ; w(watt) = number between 0 and 3600 ; pf(powerfactor) = number between -1 and 1*  
> @returns **Promise<data>** *: json: number of successful inserts*  
>```js
> {
>	"inserted": number
>}
>```

***`insertPowerUsage(stoneId = string, data = array of timeAndPower)
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **data** *: array of timeAndPower; {time = timestamp, kWh = number }; number;format emitted by javascripts new Date().toValue() ; kWh(kilowatt hour) = number between 0 and infinity ; 
> @returns **Promise<data>** *: json: number of successful inserts*
>```js
> {
>	"inserted": number
>}
>```
