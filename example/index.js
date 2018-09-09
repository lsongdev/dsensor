const { HCHO } = require('..');

const hc = new HCHO("/dev/xxx");

hc.send(0xe2, 0xaabb);