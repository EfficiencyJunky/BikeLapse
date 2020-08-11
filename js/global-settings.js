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

// when clicking on a BikeLapse ride, we will zoom into the ride
// these two settings will tell the zoom function to add padding
let paddingTopLeft = [450, 0]; //[leftside, top]
let paddingBottomRight = [100, 0]; //[rightside, bottom]

// settings for map UI elements
let mapUISettings = {
  "baseLayerCtl":     { "position": "topright",        "collapsed": true   },
  "overlayLayerCtl":  { "position": "topleft",         "collapsed": false  },
  "legend":           { "position": "bottomright"                          },
  "videoViewer":      { "position": "bottomleft"                           },
  "elevation":        { "position": "bottomleft"                           },
  "zoomCtl":          { "position": "topright"                             },
};


// *******************************************
// YOUTUBE PLAYER PARAMETERS
// *******************************************
let videoHeight = 250;
let videoWidth = Math.round(videoHeight * 1.777777);    // 250 * 1.77777 == 444 just so you know
let bindPopupProperties = {maxWidth: videoWidth + 40};

// Learn about the playerVars that can be used for this "youTubePlayerOptions" object here: https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5
let youTubePlayerOptions = { 
  // 'autoplay': 1, 
  'controls': 0, 
  'disablekb': 1,
  'modestbranding': 1,
  'playsinline': 1, // prevents full screen when pressing play on mobile
  'fs': 0, // prevents fullscreen button (doesn't matter if 'controls' is set to 0)
  'origin': "https://bikelapse.com",
  'widget_referrer': "https://bikelapse.com",
  'rel': 0
};




/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */
// global variable that allows us to pass data to the callbacks
// that are called as the L.geoJson Layer Groups are created
let currentRideMetadata;

// these will be used when adding/removing rides
let highlightedRideID = "";


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
let elevationDisplayDiv;
let elevationControl;
let elevationControlOptions = {
  position: mapUISettings.elevation.position,
  theme: "steelblue-theme", //default: lime-theme
  width: 600,
  height: 125,
  // margins: {
  //     top: 10,
  //     right: 20,
  //     bottom: 30,
  //     left: 50
  // },
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

// the layer that holds the information for the rabit display for the elevation control
// this is the layer that will be added and removed as data is added and removed from the elevationControl layer
let elevationFollowMarkerLayer;




// ****************************************************************************
// VIDEO DISPLAY AND RABBIT MARKER
//    the videoDisplayDiv is where we will display our YouTube video iFrame
//    the rabbitMarker is what will run around on the map to show the 
//    location of each frame of the video
// ****************************************************************************
let videoDisplayDiv;

let rabbitMarker;
let rabbitMarkerOptions = {
  iconUrl: '../img/rabbit-marker.png',
  shadowUrl: '../img/rabbit-marker-shadow.png',  
  rabbitIconWidth: 200,
  rabbitIconHeight: 167,
  scaleFactor: 0.2
};
let rabbitCoordsArray;
let showRabbitOnRoute = false;






/* ###################################################################
   ****  VARIOUS OTHER INDIVIDUAL VARIABLES AND OBJECTS FOR SETTINGS
###################################################################### */



// ICON PROPERTIES AND HOW THEY TRANSLATE TO CSS:
    // iconSize: [24, 24]
        // creates css --> width: 24px; 
        // creates css --> height: 24px;
    // iconAnchor: [12, 12]
        // creates css --> margin-left: -12px;
        // creates css --> margin-top: -12px;

// any rows that appear in the below object will show up in the legend and also be added to each ride if applicable
// https://maps.gstatic.com/mapfiles/ms2/micons/POI.png
// https://maps.gstatic.com/mapfiles/ms2/micons/camera.png
// https://maps.gstatic.com/mapfiles/ms2/micons/red.png
// https://maps.gstatic.com/mapfiles/ms2/micons/green.png
let defaultIconURL = "https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png";
let bikelapseIconURL = "../img/favicon-32x32.png";
// let bikelapseIconURL = "https://maps.gstatic.com/mapfiles/ms2/micons/cycling.png";


let mapIcons = {
  "START":    {displayText: "START",   iconType: "divIcon",  iconURLorClass: "start-icon", iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "FINISH":   {displayText: "FINISH",  iconType: "divIcon",  iconURLorClass: "finish-icon", iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "DETAILS-BIKELAPSE":  {displayText: "BIKELAPSE", iconType: "regular",  iconURLorClass: bikelapseIconURL, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], legendClass:"bikelapse-icon",},
  "DETAILS-REGULAR":  {displayText: "REGULAR", iconType: "regular",  iconURLorClass: defaultIconURL, iconSize: [18, 30], iconAnchor: [18/2, 30], popupAnchor: [0, -30], legendClass:"default-icon"},
}

let mapIconsKeys = Object.keys(mapIcons);

// white -- "rgba(255, 255, 255, 1)"
// carol's bikelapse route color -- "rgb(53, 233, 218)"
let routeLineProperties = {
  "bikelapse": {"legendText": "BikeLapse",      "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgb(236, 85, 85)" },
  "regular":   {"legendText": "Regular",        "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgba(62, 146, 204, 1)" },
  "selected":  {"legendText": "Selected Route", "lineFillOpacity": 1, "lineWeight": 0.5, "lineOpacity": 1, "lineColor": "black" },
  "default":   {"legendText": "Default Color",  "lineFillOpacity": 1, "lineWeight": 4.0, "lineOpacity": 1, "lineColor": "rgba(155, 155, 155, 1)" }
};

let routeIconBaseClass = "legend-route-icon";


/* #######################################################################################
// ************ CLASSES AND CLASS EXTENSIONS ************
// ************ CLASSES AND CLASS EXTENSIONS ************
// ************ CLASSES AND CLASS EXTENSIONS ************
########################################################################################## */
// *************************************************************************************** 
// EXTEND THE BASE LEAFLET "Layer" CLASS USING ".include({myobjects})" 
//    In the documentation they use this nomenclature .include(MyMixin);"
//    Find out more here: https://leafletjs.com/reference-1.6.0.html#class
//    Since each JSON file has metadata attached to it (Ride Name, YouTube Video, etc.)
//    We will embed this metadata in each of our L.geoJson Layer Groups that
//    We create to represent each of our rides
// ***************************************************************************************     
L.Layer.include({
  getMetadata: function () {
    let options = this.options = this.options || {}; // Initialize the options, if missing.
    options.metadata = options.metadata || {}; // Initialize the metadata, if missing.
    return options.metadata;
  }
});


// ******************************************************************* 
// ASYNCRONOUS COUNTER CLASS 
//    Triggers a callback when all asyncronous tasks have completed
//    Because we only want to call the callback
//    after all the API calls etc have finished running
// *******************************************************************     
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
