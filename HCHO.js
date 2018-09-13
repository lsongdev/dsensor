const assert       = require('assert');
const SerialPort   = require('serialport');
const createReader = require('./reader');

const COMMANDS = {
  QUERY: 0x01
};

const TYPES = {
  0x00: 'NoSensor',
  0x01: 'CO',
  0x02: 'H2S',
  0x03: 'CH4',
  0x04: 'CL2',
  0x05: 'HCL',
  0x06: 'F2',
  0x07: 'HF',
  0x08: 'NH3',
  0x09: 'HCN',
  0x0a: 'PH3',
  0x0b: 'NO',
  0x0c: 'NO2',
  0x0d: 'O3',
  0x0e: 'O2',
  0x0f: 'SO2',
  0x10: 'CLO2',
  0x11: 'COCL2',
  0x12: 'PH3',
  0x13: 'SiH4',
  0x14: 'HCHO',
  0x15: 'CO2',
  0x16: 'VOC',
  0x17: 'ETO',
  0x18: 'C2H4',
  0x19: 'C2H2',
  0x1a: 'SF6',
  0x1b: 'AsH3',
  0x1c: 'H2',
  0x1d: 'TOX1',
  0x1e: 'TOX2',
  0x1f: 'L/M',
  0x20: 'BattryLevel',
};

const UNITS = {
  0x01: 'ppm',
  0x02: 'VOL',
  0x03: 'LEL',
  0x04: 'Ppb',
  0x05: 'Mg/m3',
};

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
  return {
    data,
    type: TYPES[data.TYPE],
    unit: UNITS[data.UNIT],
    value: data.VALUE / 10 ** data.VH,
    toString(){
      return `${this.type}: ${this.value}${this.unit}`;
    }
  };
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

module.exports = HCHO;