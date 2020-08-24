/* ###################################################################
   ****  OVERRIDE OR SET GLOBAL VARIABLES AND SETTINGS ****
###################################################################### */
// the height of our map based on the windowScaleFactor set in global-settings.js
// if you want to change the normal height it will be, just change "600" to something else
const mapHeight = `${600 * windowScaleFactor}px`;

// override global map zoom and ride ID parameters
minimumZoom = 2;
// maximumZoom = 18;
showRabbitIntroPopup = false;

// override global padding to use when first displaying ride
// when clicking on a BikeLapse ride, we will zoom into the ride
// these two settings will tell the zoom function to add padding
flyToPaddingTopLeft = [0, 0]; //[leftside, top]
flyToPaddingBottomRight = [0, 100]; //[rightside, bottom]

// override the position of the baselayers
mapUISettings.baseLayerCtl.position = "topright";


// This is the div in our HTML where we will display the elevationControl
// we need to grab a reference to it and store it here so our
// "initializeMapOverlaysAndUI()" function can add the elevationControl to it
rideInfoDisplayDiv = document.getElementById('ride-info-parent');


// This is the div in our HTML where we will display the elevationControl
// we need to grab a reference to it and store it here so our
// "initializeMapOverlaysAndUI()" function can add the elevationControl to it
elevationDisplayDiv = document.getElementById('elevation-display-div');

// This is the div in our HTML where we will display the YouTube Player
// currently setting this to a string so the map doesn't create a video displaydiv
// videoDisplayDiv = "REPLACE THIS WITH THE DIV";
videoDisplayDiv = document.getElementById('player-parent');

/* ###################################################################
****  CREATE-RIDE SPECIFIC VARIABLES AND SETTINGS ****
###################################################################### */

// a globally accessible reference to the Leaflet GeoJSON Layers Group
let geoJsonLayerGroup = undefined;

// REFERENCES TO OTHER HTML ELEMENTS USED FOR DISPLAYING INFO
let gpxImportProgressLabel = document.getElementById('gpx-import-progress-label');
let gpxTextarea = document.getElementById('gpx-textarea');
let geoJsonTextarea = document.getElementById('geojson-textarea');


/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAY ELEMENTS ****
################################################################################## */
// change the height of the map 
map.getContainer().style.height = mapHeight;

// Checks if the map container size changed and updates the map if so
map.invalidateSize();

// also change the placeholder text
document.getElementById('map-placeholder-text').style.lineHeight = mapHeight;

// set map initial center location and zoom for map
map.setView([30, 0], minimumZoom);



// carry out our usual initializations
initializeBaseMaps();
initializeMapOverlaysAndUI(hideElevationDisplayDiv = false, hideVideoDisplayDiv = false, hideRideInfoDisplayDiv = false);




/* ###############################################################################
   ****  ADD EVENT LISTENERS TO OUR INTERACTIVE HTML UI ELEMENTS ****
################################################################################## */

// GPX IMPORT BUTTON ONCLICK HANDLER
// a hacky way to deal with the fact that File input buttons can't be styled
// so we create a file input element in the HTML file, make it hidden
// then put a nice looking button in its place
// when that button is clicked we just send a click message to the file input element
document.getElementById('gpx-import-button').onclick = function(event){
   document.getElementById('filein').click();
}

// handler for when user finishes choosing a file after clicking gpx-import-button
document.getElementById('filein').onchange = handleGpxFileSelectionCombineAndConvertToGeoJson;

// event handler for text inputs and radio buttons in the Ride Info section
document.getElementById('ride-info-form').onkeyup = handleFormChanges;
document.getElementById('ride-info-form').onchange = handleFormChanges;

// click handler for the save changes button
document.getElementById('save-changes-button').onclick = saveChangesButtonHandler;

// click handlers for GeoJSON and GPX download buttons
document.getElementById('geojson-download-button').onclick = downloadButtonHandler;
document.getElementById('gpx-download-button').onclick = downloadButtonHandler;