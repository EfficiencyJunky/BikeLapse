/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */


/* ###############################################################################################
   ****  VARIOUS OBJECTS THAT DEFINE THE MAJORITY OF THE APP'S FUNCTIONALITY
################################################################################################## */

// setting this to "var" becauese it will need to be accessible throughout the program
var currentRideID = "";
let initialRideIDToDisplay = "ride0001";


// var fs = require('fs');
// var files = fs.readdirSync('/static/data/');
// console.log("filenames: ", files);


// let bikeRideJSONFileNames = [
//   "2020_06_21--crystalsprings.json",
//   "2020_07_05--rodeobeach.json",
//   "2020_07_15--paradiseloop.json",
//   "2020_07_11--ingleside.json"
// ]

// THIS OBJECT WILL BE UPDATED WITH THE GeoJSON DATA FROM THE LIST OF FILES ABOVE
let ridesData = {};

// CREATE A LIST OF THE BIKE RIDE NUMBERS THAT GET GENERATED AS THE FILES ARE INGESTED INTO THE 'rideData' OBJECT ABOVE
let rideIDsList = [];

// ICON PROPERTIES AND HOW THEY TRANSLATE TO CSS:
    // iconSize: [24, 24]
        // creates css --> width: 24px; 
        // creates css --> height: 24px;
    // iconAnchor: [12, 12]
        // creates css --> margin-left: -12px;
        // creates css --> margin-top: -12px;
// ORIGINAL START ICON PROPERTIES:
    // iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",   iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
// ORIGINAL FINISH ICON PROPERTIES: 
    // iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",   iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},

let mapIcons = {
  "START":    {markerText: "START",     iconType: "divIcon",  iconURLorClass: "start-icon",   iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "FINISH":   {markerText: "FINISH",    iconType: "divIcon",  iconURLorClass: "finish-icon",  iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "DETAILS":  {markerText: "DETAILS",   iconType: "default",  iconURLorClass: "legend-default-icon",    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
  // "PHOTO_OP": {markerText: "PHOTO OP",  iconType: "icon",     iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/camera.png",  iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -30]},
  // "POI":      {markerText: "POI",       iconType: "icon",     iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/POI.png",     iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]}
}

let mapIconsKeys = Object.keys(mapIcons);


/* ###################################################################
   ****  VARIOUS INDIVIDUAL VARIABLES
###################################################################### */

// chooses the default basemap to enable depending on if it's night or day
let isNight = getIsNight();
let selectedBaseMap = isNight ? "Dark Map" : "Street Map";

// map zoom parameters
let maximumZoom = 18;
let minimumZoom = 10;

// youtube video embed size variables
let videoHeight = 200;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};

// embed HTML code used to create the embeded video objects
let videoEmbedParams = {
  firstHalf: '<iframe width="' + videoWidth + '" height="' + videoHeight + '" src="https://www.youtube.com/embed/',
  secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
};





/* ###################################################################
   ****  THE MAIN MAP OBJECT
###################################################################### */
// Create our map using the div with id="map"
let myMap = L.map("map", {
    center: [37.77, -122.42], // san francisco
    zoom: 10
});





// -----------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------
/* ###########################################################################
   ****  UNUSED OBJECTS - ORIGINALLY FOR A LEGEND THAT USED COLOR CODES ***
############################################################################## */
let bikeRouteColorCodes = {
  "Color 01":  {"score":"1", "color":"#00FF00", shortDescription: "Color 01 disptext",  "description": "description for color 01"},
  "Color 02":  {"score":"2", "color":"#66ff00", shortDescription: "Color 02 disptext",  "description": "description for color 02"},
  "Color 03":  {"score":"3", "color":"#ccff00", shortDescription: "Color 03 disptext",  "description": "description for color 03"},
  "Color 04":  {"score":"4", "color":"#FFCC00", shortDescription: "Color 04 disptext",  "description": "description for color 04"},  
  "Color 05":  {"score":"5", "color":"#FF0000", shortDescription: "Color 05 disptext",  "description": "description for color 05"}
};

let bikeRouteColorCodesKeys = Object.keys(bikeRouteColorCodes);

// returns a string for the current time in "HH:MM" format
let currentTime = getCurrentTime();

// boolean that tells the legend to add a divider that shows a different color for "significant delays"
// this is just a carryover from a previous project and will likely never get used
let showSignificantColor = false;