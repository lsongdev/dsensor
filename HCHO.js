const DSensor = require('.');
const assert = require('assert');

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
  0x20: 'BatteryLevel',
};

const UNITS = {
  0x01: 'ppm',
  0x02: 'VOL',
  0x03: 'LEL',
  0x04: 'Ppb',
  0x05: 'Mg/m3',
};

class HCHO extends DSensor {
  constructor(dev){
    super(dev, createReader);
  }
  parse(raw){
    const data = {
      HEAD    : raw.readUInt16BE(0),
      LENGTH  : raw.readUIntBE(2, 1),
      TYPE    : raw.readUIntBE(3, 1),
      UNIT    : raw.readUIntBE(4, 1),
      VH      : raw.readUIntBE(5, 1),
      VALUE   : raw.readUInt16BE(6),
      CHECKSUM: raw.readUInt16BE(8),
    };
    var checksum = 0;
    for(var i=0;i<raw.length - 2;i++){
      checksum += raw[i];
    }
    assert.equal(data.HEAD, 0x424d, 'Invalid data header');
    assert.equal(checksum, data.CHECKSUM, 'Checksum error');
    return {
      raw,
      data,
      type: TYPES[data.TYPE],
      unit: UNITS[data.UNIT],
      value: data.VALUE / 10 ** data.VH,
      toString(){
        return `${this.type}: ${this.value}${this.unit}`;
      }
    };
  }
}

module.exports = HCHO;

function createReader(fn){
  const STATE_HEADER_1 = 0x42;
  const STATE_HEADER_2 = 0x4d;
  const STATE_LENGTH   = 1;
  const STATE_DATA     = 3;
  const LEN_HEADER = 2; 
  const LEN_LENGTH = 2;
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
        len = buffer.readUIntBE(index, 1);
        flag = STATE_DATA;
        continue;
      }
      if(flag === STATE_DATA && buffer.length - index >= len){
        fn(buffer.slice(index - LEN_HEADER, index + len));
        buffer = buffer.slice(index + len);
        flag = STATE_HEADER_1;
      }
    }
  };
}