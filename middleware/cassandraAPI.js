const Client = require('../client/client');


let operationCodes = Object.freeze({
  "INSERT": {"code": 100, "flags": {"Power": 1, "Energy": 2}},
  "SELECT": {"code": 200, "flags": {"Power": 1, "Energy": 2}},
  "DELETE": {"code": 500, "flags": {"Power": 1, "Energy": 2, "All" : 3}}
})

class CassandraAPI {

  constructor(){
  }

  connect(options ){
    this.tlsClient = new Client(options);
    this.tlsClient._connect();
  }

  isConnected(){
    return this.tlsClient.connected
  }

  close(){
    this.tlsClient.close();
  }

  getPowerUsage(stoneIds, beginTime, endTime){
    let selectJson = {}
    selectJson["stoneIDs"] = stoneIds
    selectJson["beginTime"] = beginTime
    selectJson["endTime"] = endTime
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, operationCodes.SELECT.flags.Power, selectJson)
  }

  getEnergyUsage(stoneIds, beginTime, endTime){
    let selectJson = {}
    selectJson["stoneIDs"] = stoneIds
    selectJson["beginTime"] = beginTime
    selectJson["endTime"] = endTime
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, operationCodes.SELECT.flags.Energy, selectJson)
  }

  deletePowerUsage(stoneId, beginTime, endTime){
    let deleteJson = {}
    deleteJson["stoneID"] = stoneId
    deleteJson["beginTime"] = beginTime
    deleteJson["endTime"] = endTime
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, operationCodes.DELETE.flags.Power, deleteJson)
  }

  deleteEnergyUsage(stoneId, beginTime, endTime){
    let deleteJson = {}
    deleteJson["stoneID"] = stoneId
    deleteJson["beginTime"] = beginTime
    deleteJson["endTime"] = endTime
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, operationCodes.DELETE.flags.Energy, deleteJson)
  }

  deleteAllUsageData(stoneId){
    let deleteJson = {}
    deleteJson["stoneID"] = stoneId
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, operationCodes.DELETE.flags.All, deleteJson)
  }

  insertEnergyUsage(stoneId, data){
    let insertJson = {}
    insertJson["stoneID"] = stoneId
    insertJson["data"] = data
    return this.tlsClient.sendMessage(operationCodes.INSERT.code, operationCodes.INSERT.flags.Energy, insertJson)
  }

  insertPowerUsage(stoneId, data){
    let insertJson = {}
    insertJson["stoneID"] = stoneId
    insertJson["data"] = data
    return this.tlsClient.sendMessage(operationCodes.INSERT.code, operationCodes.INSERT.flags.Power, insertJson)
  }

}

module.exports = CassandraAPI;