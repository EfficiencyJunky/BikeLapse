/* ###################################################################
   ****  DEFINE VARIOUS GLOBAL VARIABLES LIKE OUR MAP AND ZOOM SETTINGS ****
###################################################################### */
// override global map zoom and ride ID parameters
minimumZoom = 2;
// maximumZoom = 18;
currentRideID = "single_ride_ID"; // we're only dealing with one ride in the create-ride interface

// set map initial center location and zoom for map
map.setView([30, 0], minimumZoom);

// ********************************************************************
// CREATE A GLOBALLY ACCESSIBLE REFERENCE TO THE LEAFLET GEOJSON LAYER
// THAT WE WILL GENERATE FROM OUR RIDE DATA AND ADD/REMOVE FROM THE MAP
// ********************************************************************
let geoJsonLayer = undefined;

// This is the div in our HTML where we will display the elevationControl
elevationDisplayDiv = document.getElementById('elevation-display-div');
videoDisplayDiv = "REPLACE THIS WITH THE DIV";

/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAYS ELEMENTS ****
################################################################################## */
initializeBaseMaps();
initializeMapOverlaysAndUI();


// *************************************************************
// GET REFERENCES TO OTHER HTML ELEMENTS USED FOR DISPLAYING INFO
// *************************************************************
let gpxImportProgressLabel = document.getElementById('gpx-import-progress-label');
let gpxTextarea = document.getElementById('gpx-textarea');
let geoJsonTextarea = document.getElementById('geojson-textarea');


// *************************************************************
// ADD EVENT LISTENERS TO OUR INTERACTIVE HTML UI ELEMENTS
// *************************************************************

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


