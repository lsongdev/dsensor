const SerialPort   = require('serialport');
const createReader = require('./reader');

class HCHO extends SerialPort {
  constructor(dev){
    super(dev);
    const reader = createReader({
      LEN_LENGTH: 1
    }, message => {
      console.log(message);
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