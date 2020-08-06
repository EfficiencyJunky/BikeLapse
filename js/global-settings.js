/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */
// ridesData will be the object that holds a reference to every JSON file we import
// rideIDs will be added as the JSON files are imported
let ridesData = {};
let currentRideID = "";
let elevationRideID = "";

/* ###################################################################
   ****  THE MAIN MAP OBJECTS NEED TO BE GLOBALY ACCESSIBLE
   ****  AND SOME GLOBAL MAP AND MAP UI SETTINGS
###################################################################### */
// Create our map using the div with id="map"
let map = L.map("map", {
  center: [37.67, -122.42], // san francisco
  zoom: 10
});

// map zoom parameters
let minimumZoom = 10;
let maximumZoom = 18;
let defaultRideViewZoom = 12;

// settings for map UI elements
let mapUISettings = {
  "baseLayerCtl":     { "position": "topright",        "collapsed": true   },
  "overlayLayerCtl":  { "position": "topleft",         "collapsed": false  },
  "legend":           { "position": "bottomright"                          },
  "videoViewer":      { "position": "bottomleft"                           },
  "elevation":        { "position": "bottomleft"                           },
  "zoomCtl":          { "position": "topright"                             },
};


// *************************************************************
// SET UP A PANE FOR OUR BIKE RIDES WITH zIndex OF 399
//    setting zIndex to 399 for our 'bikeRidesPane' in this case means that
//    when rides are added and removed using the layer control UI  
//    the elevation control layer (which is automatically set to z = 400)
//    will always display on top of them 
// *************************************************************    
map.createPane('bikeRidesPane');
map.getPane('bikeRidesPane').style.zIndex = 399;


// *************************************************************
// ELEVATION CONTROL CREATION
//    the elevationControl will be used throughout the app to 
//    display the elevation for a selected ride 
//    find out more about elevation control and options here: https://github.com/MrMufflon/Leaflet.Elevation
// *************************************************************    
let elevationControlOptions = {
  position: mapUISettings.elevation.position,
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

let elevationControl = L.control.elevation(elevationControlOptions);

// the layer that holds the information for the rabit display for the elevation control
// this is the layer that will be added and removed as data is added and removed from the elevationControl layer
let elevationRabbitLayer;



/* ###################################################################
   ****  VARIOUS OTHER INDIVIDUAL VARIABLES AND OBJECTS FOR SETTINGS
###################################################################### */

// youtube video embed size variables
let videoHeight = 200;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};

// embed HTML code used to create the embeded video objects
let videoEmbedParams = {
  firstHalf: '<iframe width="' + videoWidth + '" height="' + videoHeight + '" src="https://www.youtube.com/embed/',
  secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
};

// ICON PROPERTIES AND HOW THEY TRANSLATE TO CSS:
    // iconSize: [24, 24]
        // creates css --> width: 24px; 
        // creates css --> height: 24px;
    // iconAnchor: [12, 12]
        // creates css --> margin-left: -12px;
        // creates css --> margin-top: -12px;

// any rows that appear in the below object will show up in the legend and also be added to each ride if applicable
let mapIcons = {
  "START":    {markerText: "START",     iconType: "divIcon",  iconURLorClass: "start-icon",             iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "FINISH":   {markerText: "FINISH",    iconType: "divIcon",  iconURLorClass: "finish-icon",            iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "DETAILS":  {markerText: "DETAILS",   iconType: "default",  iconURLorClass: "legend-default-icon",    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
  // "START":    {markerText: "START",     iconType: "divIcon",  iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",   iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
  // "FINISH":   {markerText: "FINISH",    iconType: "divIcon",  iconURLorClass: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",     iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]},
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



/* ##########################################################################################################
// *** ASYNCRONOUS COUNTER CLASS TO TRIGGER A CALLBACK WHEN ALL ASYNCRONOUS TASKS HAVE COMPLETED   *******
// *** BECAUSE WE ONLY WANT TO CALL THE CALLBACK AFTER ALL THE API CALLS ETC HAVE COMPLETED               *******
############################################################################################################# */
// ******* AsyncCounter Class ****************
class AsyncCounter {
  constructor(numCalls, callback){
    this.callback = callback;
    this.numCalls = numCalls;
    this.calls = 0;
  }

  increment(){
    this.calls += 1;

    if(this.calls === this.numCalls){
        this.callback();
    }
  }
}


// **************** NON MAPPING HELPER FUNCTIONS ******************
// **************** NON MAPPING HELPER FUNCTIONS ******************
// **************** NON MAPPING HELPER FUNCTIONS ******************

  // this is the function for creating rideIDs based off of the unique number being passed in
  // we're putting it in this file so that we can easily modify it if need be
  // it doesn't really matter what the rideID generation method is as long as they are all unique
function getRideID(numToPadd){
  return "ride" + String(numToPadd).padStart(4, '0');;
}



// **************** RETURN "true" IF IT'S NIGHT OR NOT ******************
  // checks to see if the local time is between 8pm and 6am
  // if so, we are considering it to be night time
function getIsNight(){
  let todaysDate = new Date();

  let HH = String(todaysDate.getHours()).padStart(2, '0');

  // if the current hour is between 8pm (20:00) and 6am, set isNight to true
  let isNight = (HH >= 20 || HH <= 6);

  return isNight;
}