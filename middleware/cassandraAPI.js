const Client = require('../client/client');

const fs = require('fs');
let localConfig = require('../middleware/config');
let localSecurityConfig = require('../middleware/config.security');

// let config = require('../config.' + (process.env.NODE_ENV || 'local'));
// let securityConfig = require('../config.security.' + (process.env.NODE_ENV || 'local'));

let operationCodes = Object.freeze({
  "INSERT": {"code": 100, "flags": {"Power": 1, "Energy": 2}},
  "SELECT": {"code": 200, "flags": {"Power": 1, "Energy": 2}},
  "DELETE": {"code": 500, "flags": {"Power": 1, "Energy": 2, "All": 3}}
});

class CassandraAPI {

  constructor() {
  }

  /**
   *
   * @param options
   */
  connect() {
    this.tlsClient = new Client({...localConfig, ...localSecurityConfig});
    this.tlsClient._connect();
  }


  /**
   * if connected true
   * @returns {boolean} -
   */
  isConnected() {
    return this.tlsClient.connected;
  }

  close() {
    this.tlsClient.close();
  }


  /**
   *
   * @param stoneIds : array of strings; ‘12-byte ‘MongoDB ObjectID'
   * @param beginTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with beginTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : data json object
   */
  getPowerUsage(stoneIds, beginTime, endTime) {
    let selectJson = {};
    selectJson["stoneIDs"] = stoneIds;
    selectJson["beginTime"] = beginTime;
    selectJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, this._numberAndJSONToBuffer(operationCodes.SELECT.flags.Power, selectJson));
  }


  /**
   *
   * @param stoneIds : array of strings; ‘12-byte ‘MongoDB ObjectID'
   * @param beginTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with beginTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : data json object
   */
  getEnergyUsage(stoneIds, beginTime, endTime) {
    let selectJson = {};
    selectJson["stoneIDs"] = stoneIds;
    selectJson["beginTime"] = beginTime;
    selectJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, this._numberAndJSONToBuffer(operationCodes.SELECT.flags.Energy, selectJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param beginTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with beginTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : json: number of successful deletions
   */
  deletePowerUsage(stoneId, beginTime, endTime) {
    let deleteJson = {};
    deleteJson["stoneID"] = stoneId;
    deleteJson["beginTime"] = beginTime;
    deleteJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, this._numberAndJSONToBuffer(operationCodes.DELETE.flags.Power, deleteJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param beginTime : uint32; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : uint32; forms a range with beginTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : json: number of successful deletions
   */
  deleteEnergyUsage(stoneId, beginTime, endTime) {
    let deleteJson = {};
    deleteJson["stoneID"] = stoneId;
    deleteJson["beginTime"] = beginTime;
    deleteJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, this._numberAndJSONToBuffer(operationCodes.DELETE.flags.Energy, deleteJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param beginTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with beginTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : json: number of successful deletions
   */
  deleteAllUsageData(stoneId) {
    let deleteJson = {};
    deleteJson["stoneID"] = stoneId;
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, this._numberAndJSONToBuffer(operationCodes.DELETE.flags.All, deleteJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param data : array of timeAndEnergy; {time = timestamp, w = number, pf = number }; time = number, format emitted by javascripts new Date().toValue(); w(watt) = number between 0 and 3600; pf(powerfactor) = number between -1 and 1
   * @returns Promise : json: number of successful inserts
   */
  insertEnergyUsage(stoneId, data) {
    let insertJson = {};
    insertJson["stoneID"] = stoneId;
    insertJson["data"] = data;
    return this.tlsClient.sendMessage(operationCodes.INSERT.code, this._numberAndJSONToBuffer(operationCodes.INSERT.flags.Energy, insertJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID' @param data *: array of timeAndPower; {time = timestamp, kWh = number };time = number, format emitted by javascripts new Date().toValue(); kWh(kilowatt hour) = number between 0 and infinity;
   * @returns Promise : json: number of successful inserts
   */
  insertPowerUsage(stoneId, data) {
    let insertJson = {};
    insertJson["stoneID"] = stoneId;
    insertJson["data"] = data;
    return this.tlsClient.sendMessage(operationCodes.INSERT.code, this._numberAndJSONToBuffer(operationCodes.INSERT.flags.Power, insertJson));
  }


  /**
   *
   * @param number
   * @param json
   * @returns {Buffer}
   * @private
   */
  _numberAndJSONToBuffer(number, json) {
    let payload = [
      number & 255,
      (number >> 8) & 255,
      (number >> 16) & 255,
    ];
    console.log(payload)
    let payloadBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    return Buffer.concat([Buffer.from(payload), payloadBuffer])
  }
}

module.exports = CassandraAPI;