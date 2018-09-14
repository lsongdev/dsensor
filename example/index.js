const { HCHO } = require('..');

const hc = new HCHO("/dev/cu.SLAB_USBtoUART");

hc.on('message', message => {
  console.log(message.toString());
});

hc.on("open", () => {
  setInterval(() => {
    hc.send(0x01, 0x00);
  }, 3000)
});