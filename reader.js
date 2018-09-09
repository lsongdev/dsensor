
function createReader({ 
  LEN_HEADER = 2, 
  LEN_LENGTH = 2,
  LEN_CHECKSUM = 2
}, fn){
  const STATE_HEADER_1 = 0x42;
  const STATE_HEADER_2 = 0x4d;
  const STATE_LENGTH   = 2;
  const STATE_DATA     = 3;
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


module.exports = createReader;