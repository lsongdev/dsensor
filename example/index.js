
const DSensor = require('..');

var sensor = new DSensor('/dev/cu.usbserial');

sensor.on('data', function(data){
  console.log(data);
});


