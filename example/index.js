const PMS5003 = require('../PMS5003');
const HCHO = require('../HCHO');

const hc = new HCHO("/dev/cu.SLAB_USBtoUART");

hc.on('message', message => {
  console.log(message.toString());
});

hc.on("open", () => {
  setInterval(() => {
    hc.send(0x01, 0x00);
  }, 3000)
});

const pm = new PMS5003('/dev/cu.usbserial');

pm.on('message', data => {
  console.log(data);
});