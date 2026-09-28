const calculerDistance = require("./utils/distance");

const restaurantLat = -3.346178;
const restaurantLng = 29.372166;

// Client fictif à Kamenge
const clientLat = -3.320000;
const clientLng = 29.375000;

const distance = calculerDistance(
  restaurantLat,
  restaurantLng,
  clientLat,
  clientLng
);

console.log("Distance :", distance.toFixed(2), "km");