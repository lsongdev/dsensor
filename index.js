const SerialPort   = require('serialport');

class DSensor extends SerialPort {
  constructor(dev, reader){
    super(dev);
    this.on('data', reader(data => {
      const message = this.parse(data);
      this.emit('message', message, data);
    }));
  }
  send(cmd, data = 0x00){
    let checksum = 0;
    if(typeof cmd === 'undefined')
      throw new TypeError('cmd must be a number or string');
    if(typeof data === 'undefined')
      throw new TypeError('data must be a number or string');
    if(typeof cmd === 'string'){
      cmd = COMMANDS[`${cmd}`.toUpperCase()];
    }
    cmd = parseInt(cmd);
    data = parseInt(data);
    const packet = Buffer.alloc(7);
    packet.writeUIntBE(0x42, 0, 1); checksum+=0x42;
    packet.writeUIntBE(0x4d, 1, 1); checksum+=0x4d;
    packet.writeUIntBE(cmd, 2, 1);  checksum+=cmd;
    packet.writeUInt16BE(data, 3);  checksum+=data;
    packet.writeUInt16BE(checksum, 5);
    return this.write(packet);
  }
}

module.exports = DSensor;