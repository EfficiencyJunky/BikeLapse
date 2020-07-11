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
let bikeRidesMetadata = {
    ride0001:  {"route_name":"SF to SM via Crystal Springs",  start: "Ritual",      finish: "SM Caltrain",  geoJSON: bikeRide0001GeoJSON, videoEmbedID: "YN9b3LK1la0", routeMap: "https://www.google.com/maps/d/edit?mid=10cQNnnBswOwCTTvcCW36Qsjviech_7ZL&usp=sharing", "line_color": "rgba(62, 146, 204, 1)"},
    ride0002:  {"route_name":"SF to Tiburon/Paradise Loop",   start: "Velo Rouge",  finish: "Velo Rouge",   geoJSON: bikeRide0002GeoJSON, videoEmbedID: "YN9b3LK1la0", routeMap: "https://www.google.com/maps/d/edit?mid=1kbFUwUOR_V6mTTQa0W-lTlp9hsY_Ekkq&usp=sharing", "line_color": "rgba(144, 252, 249, 1)"},
    ride0003:  {"route_name":"Bike Ride 03 Long Name",  "line_color": "rgba(56, 145, 166, 1)"},  
    ride0004:  {"route_name":"Bike Ride 04 Long Name",  "line_color": "rgba(42, 98, 143, 1)"}
};

// CREATE A LIST OF JUST THE MUNI LINE NUMBERS FROM THE KEYS OF THE 'MUNILinesInfo' OBJECT ABOVE
let bikeRideIDsList = Object.keys(bikeRidesMetadata);

let initialVisibleRideIndex = 0;



let mapIcons = {
  "start":    {markerText: "START",     iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",   iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]},
  "finish":   {markerText: "FINISH",    iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",     iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]},
  "details":  {markerText: "DETAILS",   iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/camera.png",  iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]},
  "photo_op": {markerText: "PHOTO OP",  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/camera.png",  iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -30]},
  "poi":      {markerText: "POI",       iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/POI.png",     iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]}
}

let videoEmbedParams = {
  firstHalf: '<iframe width="355" height="200" src="https://www.youtube.com/embed/',
  secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
};



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