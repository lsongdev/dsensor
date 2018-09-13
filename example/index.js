const { HCHO } = require('..');

const hc = new HCHO("/dev/cu.SLAB_USBtoUART");

hc.on('message', message => {
  const { VALUE, VH } = message;
  console.log(VALUE / 10 ** VH, VALUE);
});

hc.on("open", () => {
  setInterval(() => {
    hc.send(0x01, 0x00);
  }, 3000)
});