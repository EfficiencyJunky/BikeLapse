/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */


/* ###############################################################################################
   ****  VARIOUS OBJECTS THAT DEFINE THE MAJORITY OF THE APP'S FUNCTIONALITY
################################################################################################## */

// setting this to "var" becauese it will need to be accessible throughout the program
var currentRideID = "";
let initialRideIDsToDisplay = ["ride0001", "ride0003"];

// the rideID we will use for the create-ride.html map
let createRideInterfaceRideID = "single_ride_ID";


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

// initialize a global variable to hold the serialized GPX (XML) output file
let gpxFileXmlDocDom;

// let currentRideMetadata;

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
  "START":    {markerText: "START",     iconType: "divIcon",  iconURLorClass: "start-icon",             iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "FINISH":   {markerText: "FINISH",    iconType: "divIcon",  iconURLorClass: "finish-icon",            iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "DETAILS":  {markerText: "DETAILS",   iconType: "default",  iconURLorClass: "legend-default-icon",    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
  // "PHOTO_OP": {markerText: "PHOTO OP",  iconType: "icon",     iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/camera.png",  iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -30]},
  // "POI":      {markerText: "POI",       iconType: "icon",     iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/POI.png",     iconSize: [38, 38], iconAnchor: [22, 37], popupAnchor: [-3, -38]}
}

let mapIconsKeys = Object.keys(mapIcons);

// white -- "rgba(255, 255, 255, 1)"
let routeLineProperties = {
  "completed":          {"legendText": "Completed Route",        "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgba(62, 146, 204, 1)"    },
  "suggested":          {"legendText": "Suggested Route",        "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgba(251, 255, 0, 1)"     },
  "variantNormal":      {"legendText": "Variant - Normal",       "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "green"                    },
  "variantDifficult":   {"legendText": "Variant - Difficult",    "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "red"                      },
  "rabbitLayer":        {"legendText": "Selected Route",         "lineFillOpacity": 1, "lineWeight": 0.5, "lineOpacity": 1, "lineColor": "black"                    },
  "default":            {"legendText": "Default Route Color",    "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgba(155, 155, 155, 1)"   }
};

// this isn't ever used
let bikeRouteColorCodesKeys = Object.keys(routeLineProperties);

// settings for map UI elements
let mapUISettings = {
  "legend": {"position": "bottomright"},
  "layerCtl": {"position": "topright"},
  "ele": {"position": "bottomleft"}
};


// abracadabra // elevation control -- REMOVE THIS
// find out more about elevation control and options here: https://github.com/MrMufflon/Leaflet.Elevation
let elevationControlOptions = {
  position: mapUISettings.ele.position,
  theme: "steelblue-theme", //default: lime-theme
  width: 600,
  height: 125,
  margins: {
      top: 10,
      right: 20,
      bottom: 30,
      left: 50
  },
  useHeightIndicator: true, //if false a marker is drawn at map position
  interpolation: d3.curveLinear, //see https://github.com/d3/d3-shape/blob/master/README.md#area_curve
  hoverNumber: {
      decimalsX: 3, //decimals on distance (always in km)
      decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
      formatter: undefined //custom formatter function may be injected
  },
  xTicks: undefined, //number of ticks in x axis, calculated by default according to width
  yTicks: undefined, //number of ticks on y axis, calculated by default according to height
  collapsed: false,  //collapsed mode, show chart on click or mouseover
  imperial: true    //display imperial units instead of metric
}

let elevationRideID = "";


/* ###################################################################
   ****  VARIOUS INDIVIDUAL VARIABLES
###################################################################### */

// chooses the default basemap to enable depending on if it's night or day
let isNight = getIsNight();
let selectedBaseMap = isNight ? "Dark Map" : "Street Map";

// map zoom parameters
let maximumZoom = 18;
let minimumZoom = 10;
let typicalZoom = 10;

// youtube video embed size variables
let videoHeight = 200;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};

// embed HTML code used to create the embeded video objects
let videoEmbedParams = {
  firstHalf: '<iframe width="' + videoWidth + '" height="' + videoHeight + '" src="https://www.youtube.com/embed/',
  secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
};



/* ############################################################################################################################
// **************** ASYNCRONOUS COUNTER FUNCTIONS TO CONTROL WHEN WE CALL THE "createMap()" FUNCTION ******************
// **************** BECAUSE WE ONLY WANT TO CALL THIS FUNCTION AFTER ALL THE API CALLS HAVE COMPLETED *****************
############################################################################################################################### */
function asyncCounter(numCalls, callback){
  this.callback = callback;
  this.numCalls = numCalls;
  this.calls = 0;
};


asyncCounter.prototype.increment = function(){

  this.calls += 1;

  if(this.calls === this.numCalls){
      this.callback();
  }
};










// -----------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------
/* ###########################################################################
   ****  UNUSED OBJECTS - ORIGINALLY FOR A LEGEND THAT USED COLOR CODES ***  rgba(62, 146, 204, 1)
############################################################################## */


// returns a string for the current time in "HH:MM" format
let currentTime = getCurrentTime();

// boolean that tells the legend to add a divider that shows a different color for "significant delays"
// this is just a carryover from a previous project and will likely never get used
let showSignificantColor = false;