function Linear(AQIhigh, AQIlow, Conchigh, Conclow, Concentration) {
  var linear;
  var Conc = parseFloat(Concentration);
  var a;
  a = ((Conc - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
  linear = Math.round(a);
  return linear;
}

function AQIPM25(concentration) {
  concentration = parseFloat(concentration);
  concentration = (Math.floor(10 * concentration)) / 10;
  if (concentration >= 0 && concentration < 12.1) {
    return Linear(50, 0, 12, 0, concentration);
  } else if (concentration >= 12.1 && concentration < 35.5) {
    return Linear(100, 51, 35.4, 12.1, concentration);
  } else if (concentration >= 35.5 && concentration < 55.5) {
    return Linear(150, 101, 55.4, 35.5, concentration);
  } else if (concentration >= 55.5 && concentration < 150.5) {
    return Linear(200, 151, 150.4, 55.5, concentration);
  } else if (concentration >= 150.5 && concentration < 250.5) {
    return Linear(300, 201, 250.4, 150.5, concentration);
  } else if (concentration >= 250.5 && concentration < 350.5) {
    return Linear(400, 301, 350.4, 250.5, concentration);
  } else if (concentration >= 350.5 && concentration < 500.5) {
    return Linear(500, 401, 500.4, 350.5, concentration);
  } else {
    return "Out of Range";
  }
}

module.exports = AQIPM25;