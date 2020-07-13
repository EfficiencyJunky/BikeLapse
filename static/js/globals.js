/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */


/* ###############################################################################################
   ****  VARIOUS OBJECTS THAT DEFINE THE MAJORITY OF THE APP'S FUNCTIONALITY
################################################################################################## */

// setting this to "var" becauese it will need to be accessible throughout the program
var currentRideID = "0001";
let initialVisibleRideIndex = 1;

// DEFINE PARAMETERS FOR THE BIKE RIDES WE WANT TO ADD TO THE MAP
let bikeRidesMetadata = {
    ride0001:  {routName:"SF to SM via Crystal Springs",      geoJSON: bikeRide0001GeoJSON, videoEmbedID: "YN9b3LK1la0", googleMapURL: "https://www.google.com/maps/d/edit?mid=10cQNnnBswOwCTTvcCW36Qsjviech_7ZL&usp=sharing", lineColor: "rgba(62, 146, 204, 1)", /*lineColor: "rgba(62, 146, 204, 1)",*/ start: "Ritual",      finish: "SM Caltrain"},
    ride0002:  {routName:"SF to Tiburon/Paradise Loop",       geoJSON: bikeRide0002GeoJSON, videoEmbedID: "YN9b3LK1la0", googleMapURL: "https://www.google.com/maps/d/edit?mid=1kbFUwUOR_V6mTTQa0W-lTlp9hsY_Ekkq&usp=sharing", lineColor: "rgba(62, 146, 204, 1)", /*lineColor: "rgba(62, 146, 204, 1)",*/ start: "Velo Rouge",  finish: "Velo Rouge"},
    ride0003:  {routName:"SF to Rodeo Beach via Hawk Hill",   geoJSON: bikeRide0003GeoJSON, videoEmbedID: "YN9b3LK1la0", googleMapURL: "https://www.google.com/maps/d/edit?mid=1hD_JODm9txFYwx-jcN_Lk17YExy1cX_c&usp=sharing", lineColor: "rgba(62, 146, 204, 1)", /*lineColor: "rgba(62, 146, 204, 1)",*/  start: "Velo Rouge",  finish: "Velo Rouge"},  
    // ride0004:  {routName:"Part 2 Sausage De Dino",            geoJSON: bikeRide0003GeoJSON, videoEmbedID: "YN9b3LK1la0", googleMapURL: "", lineColor: "rgba(42, 98, 143, 1)"}
};

// CREATE A LIST OF THE BIKE RIDE NUMBERS FROM THE KEYS OF THE 'bikeRidesMetadata' OBJECT ABOVE
let bikeRideIDsList = Object.keys(bikeRidesMetadata);

// STRAVA SPRITE ICON PROPERTIES:
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
let userSelectedTime = getCurrentTime();

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


// boolean that tells the legend to add a divider that shows a different color for "significant delays"
let showSignificantColor = false;


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