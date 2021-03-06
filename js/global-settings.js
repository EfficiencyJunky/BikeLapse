/* ###################################################################
   **  A GLOBAL SCALE FACTOR BASED ON THE HEIGHT OF OUR WINDOW **
       This is used to scale the size of the youtube video player
       on both our index.html and create-ride.html pages
       as well as scale the height of the map on the create-ride page
       I'm only doing it once at the beginning because I'm lazy
###################################################################### */
// if the height is taller than 750px then set scale factor to 1.0 otherwise set to 0.85
// then check to see if the width is greater than 500 and leave the scale factor or set to 0.55
const windowScaleFactor = (function (){
  const scaleFact = (window.innerHeight >= 750) ? 1.0 : 0.85;
  return (window.innerWidth >= 500) ? scaleFact : 0.65;
})();

console.log("window scale factor:", windowScaleFactor);
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
let minimumZoom = 2;
let maximumZoom = 20;
let terrainMaximumZoom = 18; // the stamen.com terrain map only has tiles for max zoom of 18
let tonerMaximumZoom = 20; // the stamen.com toner map only has tiles for max zoom of 20
let defaultRideViewZoom = 12;

// when clicking on a BikeLapse ride, we will zoom into the ride
// these two settings will tell the zoom function to add padding
let flyToPaddingTopLeft = [450, 0]; //[leftside, top]
let flyToPaddingBottomRight = [100, 0]; //[rightside, bottom]

// settings for map UI elements
let mapUISettings = {
  "baseLayerCtl":     { "position": "bottomright",        "collapsed": true   },
  "overlayLayerCtl":  { "position": "topright",           "collapsed": false  },
  "legend":           { "position": "bottomright"                             },
  "rideInfo":         { "position": "topleft"                                 },
  "videoViewer":      { "position": "bottomleft"                              },
  "elevation":        { "position": "bottomleft"                              },
  "zoomCtl":          { "position": "bottomright"                             },
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


/* ###################################################################
// ****  RIDE INFO DISPLAY
//          the rideInfoDisplayDiv is where we will display our ride info
###################################################################### */
let rideInfoDisplayDiv;
let displayUnits = "imperial"; // other option is "metric"


/* ###################################################################
// ****  VIDEO DISPLAY AND RABBIT MARKER
//          the videoDisplayDiv is where we will display our YouTube video iFrame
//          the rabbitMarker is what will run around on the map to show the 
//          location of each frame of the video      
###################################################################### */
// ****************************************************************************
//  THE DIV WHERE WE WILL DISPLAY THE VIDEO (IFRAME) AND CONTROLS
// ****************************************************************************
let videoDisplayDiv;

// this will tell the youTube player to allow a frameOffset outside its tolerance
// if false, the frameOffset will be set to 0 if it is outside the tolerance
// if true, the frameOffset will be allowed 
// (this will try to sync a ride to the video even if they don't line up)
let allowOffsetOutsideTolerance = false;

// *******************************************
// YOUTUBE PLAYER PARAMETERS
// *******************************************
let videoWidth = 450 * windowScaleFactor; // make sure the "transport-controls" element is set to the same width
let videoHeight =  Math.round(videoWidth * 0.5625); // 450 * 0.5625 == 253 just so you know

// if we wanted to scale the video by height instead of width, but we really don't
// let videoHeight = 250;
// let videoWidth = Math.round(videoHeight * 1.777777); // 250 * 1.77777 == 444 just so you know

// this is likely obsolete now that our video player is in it's own DIV
let bindPopupProperties = {maxWidth: videoWidth + 40};

// this line will ensure that when we click the "hide" button on our video
// the size of the transport-controls does not shrink
document.getElementById("transport-controls").style.minWidth = `${videoWidth}px`;


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

// *******************************************
// RABBIT MARKER USED TO SHOW THE LOCATION
// FOR EACH FRAME OF THE VIDEO ON THE MAP
// *******************************************
// DECLARE OUR MUTABLE RABBIT VARIABLES TO BE USED TO UPDATE THE RABBIT'S DISPLAY
let rabbitMarker;
let rabbitCoordsArray;
let showRabbitOnRoute = false;

// if this gets set to true, then we will display an intro popup message on the rabbit
// and it will turn into a "play/pause" button after the user plays a BikeLapse video for the first time
let showRabbitIntroPopupMessage = false;

// DECLARE OUR CONSTANT RABBIT VARIABLES THAT WE WILL USE TO GENERATE THE MARKER
// if we want to change our rabbit image we can do that here
// just change the URLs for the image or image shadow
// and then set the Width/Height to the original values of the image itself
// we will scale the image using the rabbitIconScaleFactor
const rabbitImageURL = '../img/rabbit-marker.png';
const rabbitShadowImageURL = '../img/rabbit-marker-shadow.png';
const rabbitImageWidth = 200;
const rabbitImageHeight = 167;
const rabbitIconScaleFactor = 0.2;


// CALCULATE THE NECESSARY VALUES TO USE AS OUR ICON OPTIONS
const rabbitIconW = Math.round(rabbitImageWidth * rabbitIconScaleFactor);
const rabbitIconH = Math.round(rabbitImageHeight * rabbitIconScaleFactor);

const rabbitIconOptions = {
  iconUrl: rabbitImageURL,
  shadowUrl: rabbitShadowImageURL,
  iconSize:     [rabbitIconW, rabbitIconH], // size of the icon
  shadowSize:   [rabbitIconW, rabbitIconH], // size of the shadow
  iconAnchor:   [Math.round(rabbitIconW/2), rabbitIconH], // point of the icon which will correspond to marker's location
  shadowAnchor: [3, rabbitIconH],  // the same for the shadow
  popupAnchor:  [-3, -rabbitIconH] // point from which the popup should open relative to the iconAnchor
}





/* ###################################################################
// ELEVATION CONTROL
//    the elevationControl will be used throughout the app to 
//    display the elevation for a selected ride 
//    find out more about elevation control and options here: https://github.com/MrMufflon/Leaflet.Elevation
###################################################################### */
// ****************************************************************************
//  THE DIV WHERE WE WILL DISPLAY THE ELEVATION CONTROL AND TITLE
// ****************************************************************************
let elevationDisplayDiv;

// *******************************************
// THE ELEVATION CONTROL AND OPTIONS
// *******************************************
let elevationControl;
let elevationControlOptions = {
  position: mapUISettings.elevation.position,
  theme: "steelblue-theme", //default: lime-theme
  width: 600 * windowScaleFactor,
  height: 125 * windowScaleFactor,
  margins: {
      top: 20,
      right: 80,
      bottom: 25,
      left: 35
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
  imperial: (displayUnits !== "metric")    //display imperial units instead of metric
}

// ****************************************************************
// ELEVATION FOLLOW MARKER LAYER IS USED TO SHOW THE LOCATION
// FOR EACH POINT OF THE ELEVATION CONTROL ON THE MAP
// ****************************************************************
// this layer that will be added and removed as data is added and removed from the elevationControl layer
let elevationFollowMarkerLayer;





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
  "START":             {displayText: "START",   iconType: "divIcon",  iconURLorClass: "start-icon", iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "FINISH":            {displayText: "FINISH",  iconType: "divIcon",  iconURLorClass: "finish-icon", iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [1, -8]},
  "DETAILS-BIKELAPSE": {displayText: "BIKELAPSE", iconType: "regular",  iconURLorClass: bikelapseIconURL, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], legendClass:"bikelapse-icon",},
  "DETAILS-REGULAR":   {displayText: "REGULAR", iconType: "regular",  iconURLorClass: defaultIconURL, iconSize: [18, 30], iconAnchor: [18/2, 30], popupAnchor: [0, -30], legendClass:"default-icon"},
  "RABBIT":            {displayText: "RABBIT", iconType: "regular",  iconURLorClass: rabbitImageURL, iconSize: [rabbitIconW, rabbitIconH], iconAnchor: [Math.round(rabbitIconW/2), rabbitIconH], popupAnchor: [-3, -rabbitIconH], legendClass:"rabbit-icon"}
}




let mapIconsKeys = Object.keys(mapIcons);

// white -- "rgba(255, 255, 255, 1)"
// carol's bikelapse route color -- "rgb(53, 233, 218)"
let routeLineProperties = {
  "bikelapse": {"legendText": "BikeLapse",      "lineFillOpacity": 0.0, "lineWeight": 6.0, "lineOpacity": 1.0, "lineColor": "rgb(236, 85, 85)" },
  "regular":   {"legendText": "Regular",        "lineFillOpacity": 0.0, "lineWeight": 4.0, "lineOpacity": 1.0, "lineColor": "rgba(62, 146, 204, 1)" },
  "selected":  {"legendText": "Selected Route", "lineFillOpacity": 0.0, "lineWeight": 0.5, "lineOpacity": 1.0, "lineColor": "black" },
  "default":   {"legendText": "Default Color",  "lineFillOpacity": 0.0, "lineWeight": 4.0, "lineOpacity": 1.0, "lineColor": "rgba(155, 155, 155, 1)" },
  "easy":      {"legendText": "Easy",           "lineFillOpacity": 0.0, "lineWeight": 4.0, "lineOpacity": 1.0, "lineColor": "green" },
  "hard":      {"legendText": "Hard",           "lineFillOpacity": 0.0, "lineWeight": 4.0, "lineOpacity": 1.0, "lineColor": "red" }
};

let routeIconBaseClass = "legend-route-icon";





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
