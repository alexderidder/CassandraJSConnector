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
    /**
     * Event emitted after the handshake for a new connection has succesfully emitted (TLS library)
     * Check if authorised, else reconnect
     */
    this.TLSSocket.on('secureConnect', () => {
      if (this.TLSSocket.authorized) {
        this.options["session"] = this.TLSSocket.getSession();
        this.connected = true;
        clearTimeout(this.reconnectTimeout);
      }
      else {
        //Something may be wrong with your certificates
        console.log("Failed to auth TLS connection: ");
        console.log(this.TLSSocket.authorizationError);
        this.TLSSocket.destroy();
        this.connect();
      }

    });

    /**
     * Event emitted once the socket is succesfully closed (Net.Socket library)
     * Don't reconnect if it is result of TLSClient.close
     */
    this.TLSSocket.on('close', () => {
      // start the reconnect timeout every 2 seconds
      this.connected = false;

      if (this.shouldRetry === true) {
        console.log("Trying to reconnect");
        this.reconnectTimeout = setTimeout(() => {
          this.TLSSocket.destroy()
          this.connect();
        }, 2000);
      }
    });

    /**
     * Event emitted when an error occurs, close will be emitted after (Net.Socket library)
     * Print error on console
     */
    this.TLSSocket.on('error', (err) => {
      console.warn("TLS ERROR", err);
    });

    /**
     * Event emitted when data is received (Net.Socket library)
     * Server can send one piece of data, but client receive parts of this data (Depends on many factors). Parts are in order (First out, first in)
     * When full message is received: process message.
     */
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
          this._setHeaderReadTimeout(sessionId)
        }
        //Can be multiple messages in receivedMessage buffer
        while (requestLength <= this.receivedMessages.length - index) {
          //Handle the message, with a index where the message is located
          this._messageHandler(sessionId, requestLength, index);
          //When handles point to the next message
          index += requestLength;
          this.receivedHeader = false;

          //Check if header can be read again, else wait for next message
          if (this.receivedMessages.length - index >= 16) {
            //Get requestLength and sessionID from first message in messagesBuffer
            requestLength = this.receivedMessages.readUInt32LE(index);
            sessionId = this.receivedMessages.readUInt32LE(index + 8);
            //When receiving header, set a timeout in which the full message is received.
            this._setHeaderReadTimeout(sessionId);
          } else {
            break;
          }
        }
        //Remove handled messages
        this.receivedMessages = this.receivedMessages.slice(index);
      }
    });

  }

  /**
   * Setup tls connection, set EventListeners
   */
  connect() {
    this.TLSSocket = tls.connect(this.options);
    this.init()
  }

  /**
   * Destroy connection, this will trigger close event. Close listener should not reconnect.
   * Clear all timeouts
   */
  close() {
    this.shouldRetry = false;
    this.TLSSocket.destroy();

    Object.keys(this.sessions).forEach((sessionId) => {
      clearTimeout(this.sessions[sessionId].cleanupTimeout);
      clearTimeout(this.sessions[sessionId].cleanupResponseTimeout);
      this.sessions[sessionId].reject("CLOSED ERROR")
    })
  }


  /**
   * Make header with opCode and combine with payload. Sent this to the server and return a payload which wait for the server to respond
   * @param {number} opCode - operation Code of request
   * @param {number} flag - flag of request
   * @param {Buffer} payload - representing json most of the time}
   */
  sendMessage(opCode, payload) {

    return new Promise((resolve, reject) => {
      if (this.connected === false) {
        reject("Error, no connection over TLS");
        return
      }
      let preparedMessage = this._prepareMessage(opCode, payload);
      let msgId = preparedMessage.sessionId;

      let cleanupTimeout = setTimeout(() => {
        reject("Error, took more then " + MESSAGE_TIMEOUT_FROM_REQUEST_INTERVAL + " ms");
        delete this.sessions[msgId];
      }, MESSAGE_TIMEOUT_FROM_REQUEST_INTERVAL);

      this.sessions[msgId] = {resolve: resolve, cleanupTimeout: cleanupTimeout, reject: reject};

      this.TLSSocket.write(preparedMessage.request);
    });
  }

  /**
   * Calculates messageLength and generates a random messageID.
   * Concat all values to a buffer with (header + payload), message can now be sent over TLS.
   * @param opCode
   * @param payload
   * @returns {{sessionId: Number, request: Buffer}}
   * @private
   */
  _prepareMessage(opCode, payload) {
    let messageId = crypto.randomBytes(4).readUInt32LE(0);
    let headerBuffer = this._makeHeader(payload.length + 16, messageId, opCode);
    return {
      sessionId: messageId,
      request: Buffer.concat([headerBuffer, payload])
    };
  }

  /**
   * Makes 16 Byte header, with (length, messageID, 0, opCode)
   * @param length
   * @param messageId
   * @param opCode
   * @returns {Buffer}
   * @private
   */
  _makeHeader(length, messageId, opCode){
    let uInt32View = new Uint32Array(new ArrayBuffer(16));
    uInt32View[0] = length;
    uInt32View[1] = messageId;
    uInt32View[2] = 0;
    uInt32View[3] = opCode;
    return new Buffer(uInt32View.buffer);
  }


  /**
   * This method is called when full message is retrieved from TLS server. This message should pass to the cassandra API.
   * Timeouts needs to be cleared, because message arrived.
   * Per OpCode a different message should be resolved or reject.
   * @param sessionId
   * @param messageLength
   * @param index
   * @private
   */
  _messageHandler(sessionId, messageLength, index) {
    //Clear
    clearTimeout(this.sessions[sessionId].cleanupResponseTimeout);
    clearTimeout(this.sessions[sessionId].cleanupTimeout);
    //read flag, 1 and 2 -> Resolve, 1 & Unknown -> Reject
    let processedData;
    switch (this.receivedMessages.readUInt32LE(index + 16)) {
      case 1 :
        processedData = this.receivedMessages.slice(index + 20, index + messageLength).toString();
        this._resolveSession(sessionId, processedData);
        break;
      case 2 :
        processedData = "Ok no content";
        this._resolveSession(sessionId, processedData);
        break;
      case 100 :
        processedData = this.receivedMessages.slice(20).toString();
        this._rejectSession(sessionId, processedData);
        break;
      default :
        processedData = { "Code": 999 , "Message" : "Something went wrong in communication with the server"};
        this._rejectSession(sessionId, processedData);
    }
    delete this.sessions[sessionId];
  }


  /**
   * Reject promise and remove from session array
   * @param sessionId
   * @param processedData
   * @private
   */
  _rejectSession(sessionId, processedData) {
    if (this.sessions[sessionId].reject === undefined) {
      console.log("Error : sessionId doesn't exists");
      return
    }
    this.sessions[sessionId].reject(processedData);
  }

  /**
   * Resolve promise and remove from session array
   * @param sessionId
   * @param processedData
   * @private
   */
  _resolveSession(sessionId, processedData) {
    if (this.sessions[sessionId].resolve === undefined) {
      console.log("Error : sessionId doesn't exists");
      return
    }
    this.sessions[sessionId].resolve(processedData);
  }

  /**
   * When a message is not received fully, this should result in destroy and reconnect.
   * This should never happen, it's a failsave.
   * @param sessionId
   * @private
   */
  _setHeaderReadTimeout(sessionId) {
    let cleanupResponseTimeout = setTimeout(() => {
      if (this.sessions[sessionId].reject === undefined) {
        console.log("Error : sessionId doesn't exists");
        return
      }
      this.sessions[sessionId].reject("Message to short");
      this.TLSSocket.destroy();
      this.connect();
    }, MESSAGE_TIMEOUT_FROM_FIRST_RESPONSE_INTERVAL);
    this.sessions[sessionId] = {...this.sessions[sessionId], cleanupResponseTimeout: cleanupResponseTimeout};
    this.receivedHeader = true;
  }

}

module.exports = TLSClient;