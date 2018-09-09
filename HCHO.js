const assert       = require('assert');
const SerialPort   = require('serialport');
const createReader = require('./reader');

function parse(buffer){
  const data = {
    HEAD    : buffer.readUInt16BE(0),
    LENGTH  : buffer.readUIntBE(2),
    TYPE    : buffer.readUIntBE(3),
    UNIT    : buffer.readUIntBE(4),
    VH      : buffer.readUIntBE(5),
    VALUE   : buffer.readUInt16BE(6),
    CHECKSUM: buffer.readUInt16BE(8),
  };
  var checksum = 0;
  for(var i=0;i<buffer.length - 2;i++){
    checksum += buffer[i];
  }
  assert.equal(data.HEAD, 0x424d, 'Invalid data header');
  assert.equal(checksum, data.CHECKSUM, 'Checksum error');
  return data;
}

class HCHO extends SerialPort {
  constructor(dev){
    super(dev);
    const reader = createReader({
      LEN_LENGTH: 1
    }, data => {
      const message = parse(data);
      this.emit('message', message);
    });
    this.on('data', reader);
  }
  send(cmd, data){
    let checksum = 0;
    const packet = Buffer.alloc(7);
    packet.writeUIntBE(0x42, 0);   checksum+=0x42;
    packet.writeUIntBE(0x4d, 1);   checksum+=0x4d;
    packet.writeUIntBE(cmd, 2);    checksum+=cmd;
    packet.writeUInt16BE(data, 3); checksum+=data;
    packet.writeUInt16BE(checksum, 5);
    return this.write(packet);
  }
}

module.exports = HCHO;