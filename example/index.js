const { HCHO } = require('..');

const hc = new HCHO("/dev/cu.SLAB_USBtoUART");

hc.on('message', message => {
  const { VALUE, VH } = message;
  console.log('HCHO: %smg/m3', (VALUE / VH).toFixed(2));
});

hc.on("open", () => {
  setInterval(() => {
    hc.send(0x01, 0x00);
  }, 3000)
});
