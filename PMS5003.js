const fs           = require('fs');
const assert       = require('assert');
const EventEmitter = require('events');
const createReader = require('./reader');

/**
* parse sensor data
*/
function parse(buffer){
  var data = {
    Head    : buffer.readUInt16BE(00),
    Length  : buffer.readUInt16BE(02),
    PM1_0   : buffer.readUInt16BE(04),
    PM2_5   : buffer.readUInt16BE(06),
    PM10    : buffer.readUInt16BE(08),
    PM1_0_  : buffer.readUInt16BE(10),
    PM2_5_  : buffer.readUInt16BE(12),
    PM10_   : buffer.readUInt16BE(14),
    UM0_3   : buffer.readUInt16BE(16),
    UM0_5   : buffer.readUInt16BE(18),
    UM1_0   : buffer.readUInt16BE(20),
    UM2_5   : buffer.readUInt16BE(22),
    UM5_0   : buffer.readUInt16BE(24),
    UM10    : buffer.readUInt16BE(26),
    VERSION : buffer.readUInt8(28),
    ERRCODE : buffer.readUInt8(29),
    CHECKSUM: buffer.readUInt16BE(30)
  };
  var checksum = 0;
  for(var i=0;i<buffer.length - 2;i++){
    checksum += buffer[i];
  }
  assert.equal(data.Head, 0x424d, 'Invalid data header');
  assert.equal(checksum, data.CHECKSUM, 'Checksum error');
  return data;
}

/**
* DSensor
*/
class DSensor extends EventEmitter {
  constructor(dev){
    super();
    if(typeof dev === 'undefined') dev = process.stdin;
    if(typeof dev === 'string') dev = fs.createReadStream(dev);
    const reader = createReader(data => {
      const message = parse(data);
      this.emit('data', message);
    });
    dev.on('data', reader);
    return this;
  }
}

module.exports = DSensor;
