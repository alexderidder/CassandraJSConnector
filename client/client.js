'use strict';

const tls = require('tls');
const crypto = require('crypto');
const MESSAGE_TIMEOUT_FROM_REQUEST_INTERVAL = 100000; // ms
const MESSAGE_TIMEOUT_FROM_FIRST_RESPONSE_INTERVAL = 10; // ms
class TLSClient {


  constructor(options) {
    this.options = options;
    this.reconnectTimeout = null;
    this.shouldRetry = true;
    this.sessions = {};
    this.receivedMessages = new Buffer(0);
    this.receivedHeader = false;
    this.connected = false;
  }

  init() {
    this.TLSSocket.on('secureConnect', () => {
      if ( this.TLSSocket.authorized) {
        this.options["session"] = this.TLSSocket.getSession();
        // console.log(this.options)
        this.connected = true;
        clearTimeout(this.reconnectTimeout);
      }
      else {
        //Something may be wrong with your certificates
        console.log("Failed to auth TLS connection: ");
        console.log(this.TLSSocket.authorizationError);
        this.TLSSocket.destroy()
        this._connect();
      }

    });
    this.TLSSocket.on('close', () => {
      // start the reconnect timeout every 2 seconds
      this.connected = false;

      if (this.shouldRetry === true) {
        console.log("Trying to reconnect");
        this.reconnectTimeout = setTimeout(() => {
          this.TLSSocket.destroy()
          this._connect();
        }, 2000);
      }
    });
    this.TLSSocket.on('error', (err) => {
      console.warn("TLS ERROR", err);
    });
    this.TLSSocket.on('data', (data) => {
      //Set an index, and add receivedBuffer to the previous message
      let index = 0;
      let receivedBuffer = Buffer.from(data, 'utf8');
      this.receivedMessages = Buffer.concat([this.receivedMessages, receivedBuffer]);

      //Check if header can be read, else return and wait for next buffer
      if (this.receivedMessages.length >= 16) {
        //Get requestLength and sessionID from first message in messagesBuffer
        let requestLength = this.receivedMessages.readUInt32LE(0);
        let sessionId = this.receivedMessages.readUInt32LE(8);
        //When receiving header, set a timeout in which the full message is received. Do this only once.
        if (this.receivedHeader === false) {
          this._setResponseTimeoutAndHeaderRead(sessionId)
        }
        //Can be multiple messages in receivedMessage buffer
        while (requestLength <= this.receivedMessages.length - index) {
          //Handle the message, with a index where the message is located
          this._handleData(sessionId, requestLength, index);
          //When handles point to the next message
          index += requestLength;
          this.receivedHeader = false;

          //Check if header can be read again, else wait for next message
          if (this.receivedMessages.length - index >= 16) {
            //Get requestLength and sessionID from first message in messagesBuffer
            requestLength = this.receivedMessages.readUInt32LE(index);
            sessionId = this.receivedMessages.readUInt32LE(index + 8);
            //When receiving header, set a timeout in which the full message is received.
            this._setResponseTimeoutAndHeaderRead(sessionId);
          } else {
            break;
          }
        }
        //Remove handled messages
        this.receivedMessages = this.receivedMessages.slice(index);
      }
    });

  }

  _connect() {
    this.TLSSocket = tls.connect(this.options);
    this.init()
  }

  close() {
    this.shouldRetry = false;
    this.TLSSocket.destroy();

    Object.keys(this.sessions).forEach((sessionId) => {
      clearTimeout(this.sessions[sessionId].cleanupTimeout);
      clearTimeout(this.sessions[sessionId].cleanupResponseTimeout);
      this.sessions[sessionId].reject("CLOSED ERROR")
    })
  }

  sendMessage(opCode, flag, message) {

    return new Promise((resolve, reject) => {
      if (this.connected === false) {
        reject("Error, no connection over TLS");
        return
      }
      let preparedMessage = this._prepareMessage(opCode, flag, message);
      let msgId = preparedMessage.sessionId;

      let cleanupTimeout = setTimeout(() => {
        reject("Error, took more then " + MESSAGE_TIMEOUT_FROM_REQUEST_INTERVAL + " ms");
        delete this.sessions[msgId];
      }, MESSAGE_TIMEOUT_FROM_REQUEST_INTERVAL);

      this.sessions[msgId] = {resolve: resolve, cleanupTimeout: cleanupTimeout, reject: reject};

      this.TLSSocket.write(preparedMessage.request);
    });
  }

  _prepareMessage(opCode, flag, message) {
    let messageId = crypto.randomBytes(4).readUInt32LE(0);
    let buffer = new ArrayBuffer(20);
    let uint32View = new Uint32Array(buffer);
    let payloadBuffer = Buffer.from(JSON.stringify(message), 'utf8');
    uint32View[0] = payloadBuffer.length + 20;
    uint32View[1] = messageId;
    uint32View[3] = opCode;
    uint32View[4] = flag;
    return {
      sessionId: messageId,
      request: Buffer.concat([new Buffer(uint32View.buffer), payloadBuffer])
    };
  }

  _handleData(sessionId, messageLength, index) {
    clearTimeout(this.sessions[sessionId].cleanupResponseTimeout);
    clearTimeout(this.sessions[sessionId].cleanupTimeout);
    //read flag
    let processedData
    switch (this.receivedMessages.readUInt32LE(index + 16)) {
      case 1 :
        processedData = JSON.stringify((this.receivedMessages.slice(index + 20, index + messageLength).toString()));
        this._resolveSession(sessionId, processedData);
        break;
      case 2 :
        processedData = "Ok no content";
        this._resolveSession(sessionId, processedData);
        break;
      case 100 :
        processedData = JSON.stringify(this.receivedMessages.slice(20).toString());
        this._rejectSession(sessionId, processedData);
        break;
      default :
        processedData = "Flag doesn't exist";
        this._rejectSession(sessionId, processedData);
    }
    delete this.sessions[sessionId];
  }

  _rejectSession(sessionId, processedData) {
    if (this.sessions[sessionId].reject === undefined) {
      console.log("Error : sessionId doesn't exists");
      return
    }
    this.sessions[sessionId].reject(processedData);
  }

  _resolveSession(sessionId, processedData) {
    if (this.sessions[sessionId].resolve === undefined) {
      console.log("Error : sessionId doesn't exists");
      return
    }
    this.sessions[sessionId].resolve(processedData);
  }

  _setResponseTimeoutAndHeaderRead(sessionId) {
    let cleanupResponseTimeout = setTimeout(() => {
      if (this.sessions[sessionId].reject === undefined) {
        console.log("Error : sessionId doesn't exists");
        return
      }
      this.sessions[sessionId].reject("Message to short");
      this.TLSSocket.destroy();
      this._connect();
    }, MESSAGE_TIMEOUT_FROM_FIRST_RESPONSE_INTERVAL);
    this.sessions[sessionId] = {...this.sessions[sessionId], cleanupResponseTimeout: cleanupResponseTimeout};
    this.receivedHeader = true;
  }

}

module.exports = TLSClient;