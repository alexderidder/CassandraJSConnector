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
let BluenetLib = require("../middleware/cassandraAPI")

// create a Bluenet instance
const cassandraAPI = new CassandraAPI();

// connect
client.connect(options);
```

BluenetLib has a number of methods available:

***`getPowerUsage(options)`***
>@param **options** *: [TLS Server options documentation](https://nodejs.org/api/tls.html#tls_new_tls_tlssocket_socket_options "TLSServer Documentation")*
>@returns void

### Select
***`getPowerUsage(stoneIds = [ “5b8d0088acc9bc0004af2cc5”], beginTime =  “1543921010507”, endTime = “1543921010507”)`***
> @param **stoneIds** *: array of strings; ‘12-byte ‘MongoDB ObjectID'*
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*
> @returns **Promise<data>** *; data json object*
>```json
> {
>   "startTime":"1543921010507", //optional
>   "endTime":"1543921010507", //optional
>   "interval":0, //optional
>   "stones":[
>      {
>         "stoneID":"5b8d0088acc9bc0004af2cc5",
>         "Data":[
>            {
>               "time":"1543921010507",
>               "value":
>               {
>                    "kWh" : 3.0233014
>               }
>            },
>            {
>               "time":"1543921010507",
>               "value":
>               {
>                   "kWh" : 2.188571
>               }
>            }
>         ]
>      }
>   ]
>}
>```


***`getEnergyUsage(stoneIds = [ “5b8d0088acc9bc0004af2cc5”], beginTime =  “1543921010507”, endTime = “1543921010507”)`***
> @param **stoneIds** *: array of strings; ‘12-byte ‘MongoDB ObjectID'*
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*
> @returns **Promise<data>** *; data json object*
>```json
> {
>   "startTime":"1543921010507", //optional
>   "endTime":"1543921010507", //optional
>   "interval":0, //optional
>   "stones":[
>      {
>         "stoneID":"5b8d0088acc9bc0004af2cc5",
>         "Data":[
>            {
>               "time":"1543921010507",
>               "value":
>               {
>                       "w":3,
>						"pf":1
>               }
>            },
>            {
>               "time":"1543921010507",
>               "value":
>               {
>           	  		"w":3,
>              			"pf":1
>               }
>            }
>         ]
>      }
>   ]
>}
>```

## Delete

***`deletePowerUsage(stoneId =  “5b8d0088acc9bc0004af2cc5” , beginTime =  “1543921010507”, endTime = 1543921010507”)
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*
> @returns **Promise<data>** *; json: number of successful deletions*
>```json
> {
>	 "deleted":1000
>}
>```

***`deleteEnergyUsage(stoneId =  “5b8d0088acc9bc0004af2cc5” , beginTime =  “1543921010507”, endTime = 1543921010507”)
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*
> @returns **Promise<data>** *; json: number of successful deletions*
>```json
> {
>	 "deleted":1000
>}
>```

***`deleteAllUsageData(stoneId =  “5b8d0088acc9bc0004af2cc5” , beginTime =  “1543921010507”, endTime = 1543921010507”)
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **beginTime** *: uint32; forms a range with endtime;  format emitted by javascripts new Date().toValue()*
> @param **endTime** *: uint32; forms a range with beginTime;  format emitted by javascripts new Date().toValue()*
> @returns **Promise<data>** *; json: number of successful deletions*
>```json
> {
>	 "deleted":1000
>}
>```

***`insertEnergyUsage(stoneId = “5b8d0088acc9bc0004af2cc5”, data = [Object timeAndKWh])
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **data** *: array of timeAndWattPowerFactor; {time = “1543921010507”, w = 3.12, pf = 1 }; uint32;format emitted by javascripts new Date().toValue() ; w(watt) = float between 0 and 3600 ; pf(powerfactor) = float between -1 and 1*
> @returns **Promise<data>** *; json: number of successful inserts*
>```json
> {
>	"inserted":1000
>}
>```

***`insertPowerUsage(stoneId = “5b8d0088acc9bc0004af2cc5”, data = [Object timeAndKWh])
`***
> @param **stoneId** *: string; ‘12-byte ‘MongoDB ObjectID'*
> @param **data** *: array of timeAndWattPowerFactor; {time = “1543921010507”, w = 3.12, pf = 1 }; uint32;format emitted by javascripts new Date().toValue() ; w(watt) = float between 0 and 3600 ; pf(powerfactor) = float between -1 and 1*
> @returns **Promise<data>** *; json: number of successful inserts*
>```json
> {
>	"inserted":1000
>}
>```
