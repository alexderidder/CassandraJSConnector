const Client = require('./client');
const crypto = require('crypto');
const tls = require('tls');
let localConfig = require('../middleware/config');
let localSecurityConfig = require('../middleware/config.security');

jest.mock('crypto');
jest.mock('tls');


test('Check prepare message session id creation', () => {
  tls.checkServerIdentity.mockReturnValue("AAPJE");
  console.log(tls.checkServerIdentity());
  new Client({...localConfig, ...localSecurityConfig})
});

test('Check prepare message session id creation', () => {
  crypto.randomBytes.mockReturnValue(new Buffer([1, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).request).toEqual(new Buffer([16, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(1);

  crypto.randomBytes.mockReturnValue(new Buffer([0, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).request).toEqual(new Buffer([16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(0);

  crypto.randomBytes.mockReturnValue(new Buffer([1, 1, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).request).toEqual(new Buffer([16, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(257);

  crypto.randomBytes.mockReturnValue(new Buffer([1, 1, 1, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).request).toEqual(new Buffer([16, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 100, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(65793);


  crypto.randomBytes.mockReturnValue(new Buffer([1, 1, 1, 1]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).request).toEqual(new Buffer([16, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 100, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(16843009);


});

test('Check prepare message session id with payload', () => {
  crypto.randomBytes.mockReturnValue(new Buffer([1, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).request).toEqual(new Buffer([26, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(1);

  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])).request).toEqual(new Buffer([26, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(1);

  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([16, 16, 16, 16, 0, 0, 0, 0, 0, 0])).request).toEqual(new Buffer([26, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0]));
  expect(new Client({...localConfig, ...localSecurityConfig})._prepareMessage(100, new Buffer([])).sessionId).toEqual(1);

});