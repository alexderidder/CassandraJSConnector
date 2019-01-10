const Client = require('../client/client');

const fs = require('fs');
let localConfig = require('../middleware/config');
let localSecurityConfig = require('../middleware/config.security');

// let config = require('../config.' + (process.env.NODE_ENV || 'local'));
// let securityConfig = require('../config.security.' + (process.env.NODE_ENV || 'local'));

let operationCodes = Object.freeze({
  "INSERT": {"code": 100, "flags": {"Energy": 1, "Power": 2}},
  "SELECT": {"code": 200, "flags": {"Energy": 1, "Power": 2}},
  "DELETE": {"code": 500, "flags": {"Energy": 1, "Power": 2, "All": 3}}
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
   * @param startTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with startTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : data json object
   */
  getEnergyUsage1(stoneIds, startTime, endTime) {
    let selectJson = {};
    selectJson["stoneIDs"] = stoneIds;
    selectJson["startTime"] = startTime;
    selectJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, this._numberAndJSONToBuffer(operationCodes.SELECT.flags.Energy, selectJson));
  }


  /**
   *
   * @param stoneIds : array of strings; ‘12-byte ‘MongoDB ObjectID'
   * @param startTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with startTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : data json object
   */
  getPowerUsage(stoneIds, startTime, endTime) {
    let selectJson = {};
    selectJson["stoneIDs"] = stoneIds;
    selectJson["startTime"] = startTime;
    selectJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.SELECT.code, this._numberAndJSONToBuffer(operationCodes.SELECT.flags.Power, selectJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param startTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with startTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : json: number of successful deletions
   */
  deleteEnergyUsage(stoneId, startTime, endTime) {
    let deleteJson = {};
    deleteJson["stoneID"] = stoneId;
    deleteJson["startTime"] = startTime;
    deleteJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, this._numberAndJSONToBuffer(operationCodes.DELETE.flags.Energy, deleteJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param startTime : uint32; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : uint32; forms a range with startTime; format emitted by javascripts new Date().toValue()
   * @returns Promise : json: number of successful deletions
   */
  deletePowerUsage(stoneId, startTime, endTime) {
    let deleteJson = {};
    deleteJson["stoneID"] = stoneId;
    deleteJson["startTime"] = startTime;
    deleteJson["endTime"] = endTime;
    return this.tlsClient.sendMessage(operationCodes.DELETE.code, this._numberAndJSONToBuffer(operationCodes.DELETE.flags.Power, deleteJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID'
   * @param startTime : number; forms a range with endtime; format emitted by javascripts new Date().toValue()
   * @param endTime : number; forms a range with startTime; format emitted by javascripts new Date().toValue()
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
  insertPowerUsage1(stoneId, data) {
    let insertJson = {};
    insertJson["stoneID"] = stoneId;
    insertJson["data"] = data;
    return this.tlsClient.sendMessage(operationCodes.INSERT.code, this._numberAndJSONToBuffer(operationCodes.INSERT.flags.Power, insertJson));
  }


  /**
   *
   * @param stoneId : string; ‘12-byte ‘MongoDB ObjectID' @param data *: array of timeAndPower; {time = timestamp, kWh = number };time = number, format emitted by javascripts new Date().toValue(); kWh(kilowatt hour) = number between 0 and infinity;
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
      (number >> 24) & 255,
    ];
    console.log(payload)
    let payloadBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    return Buffer.concat([Buffer.from(payload), payloadBuffer])
  }
}

module.exports = CassandraAPI;