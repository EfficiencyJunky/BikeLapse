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

/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAYS ELEMENTS ****
################################################################################## */
initializeMap();

// *************************************************************
// GET REFERENCES TO HTML ELEMENTS USED FOR DISPLAYING INFO
// *************************************************************
let gpxImportProgressLabel = document.getElementById('gpx-import-progress-label');
let gpxTextarea = document.getElementById('gpx-textarea');
let geoJsonTextarea = document.getElementById('geojson-textarea');
let elevationDisplayDiv = document.getElementById('elevation-display');

// *************************************************************
// ADD EVENT LISTENERS TO OUR INTERACTIVE HTML UI ELEMENTS
// *************************************************************
// handlers for when user clicks gpx-import-button and chooses a file
document.getElementById('gpx-import-button').onclick = handleGPXButtonClick;
document.getElementById('filein').onchange = handleGpxFileSelectionCombineAndConvertToGeoJson;

// event handler for text inputs and radio buttons in the Ride Info section
document.getElementById('ride-info-form').onkeyup = handleFormChanges;
document.getElementById('ride-info-form').onchange = handleFormChanges;

// click handler for the save changes button
document.getElementById('save-changes-button').onclick = saveChangesButtonHandler;

// click handlers for download buttons
document.getElementById('geojson-download-button').onclick = downloadButtonHandler;
document.getElementById('gpx-download-button').onclick = downloadButtonHandler;


