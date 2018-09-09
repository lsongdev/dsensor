
const STATE_HEADER_1 = 0x42;
const STATE_HEADER_2 = 0x4d;
const STATE_LENGTH   = 2;
const STATE_DATA     = 3;

const LEN_HEADER = 2;
const LEN_CHECKSUM = 2;

function createReader(fn){
  let state = STATE_HEADER_1, buffer = Buffer.alloc(0), len;
  return chunk => {
    buffer = Buffer.concat([ buffer, chunk ]);
    for(const i = 0; i < buffer.length; i++){
      if(state === STATE_HEADER_1 && buffer[i] === STATE_HEADER_1){
        state = STATE_HEADER_2;
        continue;
      }
      if(state === STATE_HEADER_2 && buffer[i] === STATE_HEADER_2){
        state = STATE_LENGTH;
        continue;
      }
      if(state === STATE_LENGTH){
        len = buffer.readUInt16BE(index);
        state = STATE_DATA;
        continue;
      }
      if(state === STATE_DATA){
        fn(buffer.slice(index - LEN_HEADER, index + len + LEN_CHECKSUM));
        buffer = buffer.slice(index + len + LEN_CHECKSUM);
        state = STATE_HEADER_1;
      }
    }
  };
}

module.exports = createReader;