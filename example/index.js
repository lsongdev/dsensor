const { HCHO } = require('..');

const hc = new HCHO("/dev/ttyUSB0");

hc.on('message', message => {
  console.log(message);
});

hc.on("open", () => {
  setInterval(() => {
    hc.send(0x01, 0x00);
  }, 3000)
});
