const EventEmitter = require('events');

class DSensor extends EventEmitter {

}

DSensor.HCHO = require('./HCHO');
DSensor.PMS5003 = require('./PMS5003');

module.exports = DSensor;