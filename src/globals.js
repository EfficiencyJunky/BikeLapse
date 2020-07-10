/* ###################################################################
   ****  ALL OF OUR GLOBAL VARIABLES
###################################################################### */

let bikeRouteColorCodes = {
  "Color 01":  {"score":"1", "color":"#00FF00", "short_description": "Color 01 disptext",  "description": "description for color 01"},
  "Color 02":  {"score":"2", "color":"#66ff00", "short_description": "Color 02 disptext",  "description": "description for color 02"},
  "Color 03":  {"score":"3", "color":"#ccff00", "short_description": "Color 03 disptext",  "description": "description for color 03"},
  "Color 04":  {"score":"4", "color":"#FFCC00", "short_description": "Color 04 disptext",  "description": "description for color 04"},  
  "Color 05":  {"score":"5", "color":"#FF0000", "short_description": "Color 05 disptext",  "description": "description for color 05"}
};

let bikeRouteColorCodesKeys = Object.keys(bikeRouteColorCodes);

// DEFINE WHICH LINES WE WANT TO ADD TO THE MAP AND SOME METADATA FOR EACH OF THEM
let bikeRidesInfo = {
    "Ride Name 01":  {"long_name":"Bike Ride 01 Long Name",  "color": "rgba(144, 252, 249, 1)"},
    "Ride Name 02":  {"long_name":"Bike Ride 02 Long Name",  "color": "rgba(62, 146, 204, 1)"},
    "Ride Name 03":  {"long_name":"Bike Ride 03 Long Name",  "color": "rgba(56, 145, 166, 1)"},  
    "Ride Name 04":  {"long_name":"Bike Ride 04 Long Name",  "color": "rgba(42, 98, 143, 1)"}
};

// CREATE A LIST OF JUST THE MUNI LINE NUMBERS FROM THE KEYS OF THE 'MUNILinesInfo' OBJECT ABOVE
let BikeRideNamesList = Object.keys(bikeRidesInfo);

let userSelectedTime = getCurrentTime();
let isNight = getIsNight();

// map parameters
let maximumZoom = 18;
let minimumZoom = 10;

// boolean that tells the legend to add a divider that shows a different color for "significant delays"
let showSignificantColor = false;

let selectedBaseMap = isNight ? "Dark Map" : "Street Map";

// Create our map using the div with id="map"
let myMap = L.map("map", {
    center: [37.77, -122.42], // san francisco
    zoom: 10
});