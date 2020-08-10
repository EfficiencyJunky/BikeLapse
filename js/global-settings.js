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



// youtube video embed size variables
let videoHeight = 250;
let videoWidth = Math.round(videoHeight * 1.777777);    // 250 * 1.77777 == 444 just so you know
let bindPopupProperties = {maxWidth: videoWidth + 40};

// embed HTML code used to create the embeded video objects
// let videoEmbedParams = {
//   firstHalf: '<iframe width="' + videoWidth + '" height="' + videoHeight + '" src="https://www.youtube.com/embed/',
//   secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
// };


/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */
// ridesData will be the object that holds a reference to every JSON file we import
// rideIDs will be added as the JSON files are imported
let ridesData = {};
let currentRideID = "";
let highlightedRideID = "";
let youTubeRideID = "";


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


// ##### ABRACADABRA ####### // ##### ABRACADABRA #######
// ##### ABRACADABRA ####### // ##### ABRACADABRA #######
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

// ##### ABRACADABRA ####### // ##### ABRACADABRA #######
// ##### ABRACADABRA ####### // ##### ABRACADABRA #######




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


// **************** GLOBAL HELPER FUNCTIONS ******************
// **************** GLOBAL HELPER FUNCTIONS ******************
// **************** GLOBAL HELPER FUNCTIONS ******************

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

