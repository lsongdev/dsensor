const DSensor = require('.');
const assert = require('assert');

/**
* DSensor
*/
class PMS5003 extends DSensor {
  constructor(dev){
    super(dev, createReader);
    return this;
  }
  /**
  * parse sensor data
  */
  parse(buffer){
    const data = {
      HEAD    : buffer.readUInt16BE(0),
      LENGTH  : buffer.readUInt16BE(2),
      PM1_0   : buffer.readUInt16BE(4),
      PM2_5   : buffer.readUInt16BE(6),
      PM10    : buffer.readUInt16BE(8),
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
    assert.equal(data.HEAD, 0x424d, 'Invalid data header');
    assert.equal(checksum, data.CHECKSUM, 'Checksum error');
    return data;
  }
}

module.exports = PMS5003;

function createReader(fn){
  const STATE_HEADER_1 = 0x42;
  const STATE_HEADER_2 = 0x4d;
  const STATE_LENGTH   = 2;
  const STATE_DATA     = 3;
  const LEN_HEADER = 2;
  const LEN_LENGTH = 2;
  const LEN_CHECKSUM = 2;
  var flag = STATE_HEADER_1, index, len, buffer = Buffer.alloc(0);
  return function(chunk){
    buffer = Buffer.concat([ buffer, chunk ]);
    for(var i = 0; i < buffer.length; i++){
      if(flag === STATE_HEADER_1 && buffer[i] === STATE_HEADER_1){
        flag = STATE_HEADER_2;
        continue;
      }
      if(flag === STATE_HEADER_2 && buffer[i] === STATE_HEADER_2){
        flag = STATE_LENGTH;
        index = ++i;
        continue;
      }
      if(flag === STATE_LENGTH && buffer.length - index >= LEN_LENGTH){
        len = buffer.readUInt16BE(index);
        flag = STATE_DATA;
        continue;
      }
      if(flag === STATE_DATA && buffer.length - index >= len + LEN_CHECKSUM){
        fn(buffer.slice(index - LEN_HEADER, index + len + LEN_CHECKSUM));
        buffer = buffer.slice(index + len + LEN_CHECKSUM);
        flag = STATE_HEADER_1;
      }
    }
  };
}