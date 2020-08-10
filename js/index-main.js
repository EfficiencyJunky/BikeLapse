/* ###################################################################
   ****  DEFINE VARIOUS GLOBAL VARIABLES LIKE OUR MAP AND ZOOM SETTINGS ****
###################################################################### */
let initialRideIDsToDisplay = ["ride0001", "ride0003", "ride0007", "ride0008"];


// "overlayLayerControl" layer is the L.control with checkboxes to hide/unhide rides on the map
// we can add it to the map first with baseLayer and overlayLayer arguments set as "undefined"
// then as we asyncronously read in the rideJSON files we will add the rides to it
let overlayLayerControl = L.control.layers(undefined, undefined, {
  collapsed: mapUISettings.overlayLayerCtl.collapsed,
  position: mapUISettings.overlayLayerCtl.position
}).addTo(map);

// move the zoom control to the position specified in the mapUISettings object
map.zoomControl.setPosition(mapUISettings.zoomCtl.position);


/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAYS ELEMENTS ****
################################################################################## */
initializeBaseMaps();
initializeMapOverlaysAndUI();

/* ###############################################################################
   ****  LOAD THE JSON FILES FOR EACH RIDE                  ****
   ****  LISTED IN THE "all_ride_file_names.js" FILE        ****
################################################################################## */

// "bikeRideJSONFileNames" is a variable found in the "all_ride_file_names.js" file
bikeRideJSONFileNames.forEach( (jsonFileName, i) => {

  let jsonFilePath = "data/" + jsonFileName;
  
  // Perform a GET request to the query URL either with D3 or with Fetch
  // d3.json(jsonFilePath).then( function(rideJSON) {
  fetch(jsonFilePath)
    .then(response => response.json()) // Transform the data into json
    .then(rideJSON => {
    
      // ****************************************************************************
      // CREATE A UNIQUE RIDE ID 
      //    THEN EMBED IT IN EVERY FEATURE OF THE JSON OBJECT 
      //    AND STORE THE JSON IN AN OBJECT WITH THE rideID AS ITS KEY
      // ****************************************************************************

      // create a new rideID that gets incremented by 1 for each file we read in
      // this way we can store the rideJSONs by rideID and not file name
      // we set the global variable "currentRideID" to be the rideID for this ride
      // this global variable will be used to access the correct data for this ride
      // in the 'filter', 'pointToLayer', 'onEachFeature', and 'style'
      // functions used to create the geoJson layer below
      currentRideID = getRideID(i+1);
      
      // save the rideID in the "metadata" of the rideJSON
      rideJSON.metadata["rideID"] = currentRideID;

      // also save the rideID in the "properties" of each feature in the rideJSON
      // this is used as a reference for events that occur on each feature later
      rideJSON.features.forEach((feature) => {
        feature.properties["rideID"] = currentRideID;
      });

      // finally store the rideJSON in the 'ridesData' object using the 'rideID' as the key
      ridesData[currentRideID] = rideJSON;
      
      // set the global variable "currentRideID" to be the rideID for this ride
      // this global variable will be used to access the correct data for this ride
      // in the 'filter', 'pointToLayer', 'onEachFeature', and 'style'
      // functions used to create the geoJson layer below
      // currentRideID = rideID;

      // ****************************************************************************
      // CREATE A GEOJSON LAYER FOR THE 'rideJSON'
      //    ATTACH EVENT LISTENER FOR WHEN WE CLICK ON THE LAYER IN THE MAP
      //    ATTACH EVENT LISTENER FOR WHEN WE REMOVE THE LAYER FROM THE MAP (UNCHECK IT)
      // ****************************************************************************
      let geoJsonLayerGroup = L.geoJson(rideJSON, { 
                                                    pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                    filter: filterFunction,
                                                    pointToLayer: pointToLayerFunction,
                                                    onEachFeature: onEachFeatureFunction,
                                                    style: styleFunction
                                                    // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: rideMetadata.lineColor}
                                                  });


      // called when a user clicks on any part of the geoJsonLayerGroup (Point, LineString, etc.)
      geoJsonLayerGroup.on('click dblclick', geoJsonLayerGroupClicked);

      // called when a user removes the layer from the map by unchecking the checkbox
      // contained in the overlayLayerControl 
      geoJsonLayerGroup.on('remove', geoJsonLayerGroupRemoved);


      // ****************************************************************************
      // ADD THE GEOJSON LAYER GROUP TO THE OVERLAY LAYER CONTROL
      // AND ADD TO THE MAP IF "currentRideID" MATCHES ONE IN THE "initialRideIDsToDisplay" aray
      //    grab the ride's name from metadata and use as the display text in the layer control
      // ****************************************************************************

      // add the geoJsonLayerGroup to the layer control using the rides name as the display text      
      overlayLayerControl.addOverlay(geoJsonLayerGroup, rideJSON.metadata.rideName);
      
      // if the ride id matches one of those in the 'initialRideIDsToDisplay' array, add it to the map
      if(initialRideIDsToDisplay.includes(currentRideID)){
        geoJsonLayerGroup.addTo(map);
      }

  });

});


// *************************************************************
//  GEOJSON LAYER "on click dblclick" EVENT CALLBACK
// *************************************************************
function geoJsonLayerGroupClicked(event){

  // event.target gives us the entire GeoJSON Layer Group 
  let geoJsonLGroup = event.target;
  // let layerClicked = event.layer; // does the same thing as the one above but "layer" is the actual layer we clicked on from the geoJsonLayer group
  
  // we can use the "getLayers()" function to grab all the layers and since
  // we have previously added the rideID to every layer in the group, we
  // just grab the first layer in the group with [0] and then get its rideID
  let clickedRideID = geoJsonLGroup.getLayers()[0].feature.properties.rideID;


  if(clickedRideID === undefined){
    console.log("RIDE ID DOESN'T EXIST");
    return false;
  }
  else if(highlightedRideID !== clickedRideID){
    
    displaySelectedRide(clickedRideID, geoJsonLGroup);

    if(ridesData[clickedRideID].metadata.hasBikeLapseSync){
      reCenterMapWithBounds(geoJsonLGroup);
    }
    
    // lastly, set our highlightedRideID to the clickedRideID
    highlightedRideID = clickedRideID;
  }
  else{
    console.log('clicked on ride with same "highlightedRideID" as before: ', highlightedRideID); 
  }

}


// *************************************************************
//  GEOJSON LAYER "on remove" EVENT CALLBACK
// *************************************************************
// when a geoJsonLayer (group) is removed, check and see if it is the one
// that is currently being highlighted (the last one to be clicked)
// if it is, we want to reset and remove all UI and display elements
function geoJsonLayerGroupRemoved(event){
  // event.target gives us the entire GeoJSON LayerGroup
  // so we use the "getLayers()" function to grab all the layers and since
  // we have previously added the rideID to every layer in the group, we
  // just grab the first layer in the group with [0] and then get its rideID
  let removedRideID = event.target.getLayers()[0].feature.properties.rideID;

  if(removedRideID === highlightedRideID) {

    // first remove the elevationFollowMarkerLayer from the map
    elevationFollowMarkerLayer.remove();
    elevationDisplayDiv.hidden = true;

    // if the videoDisplayDiv is not hidden, then the ride has a video playing
    // in this case we need to stop the video, remove the rabbit if it is on the map
    // and then set the videoDisplayDiv's hidden attribute to true
    if(videoDisplayDiv.hidden !== true){
      // the order here is important showRabbitOnRoute = false must go first
      // the youtube API is slow to respond and so the rabbit update interval timer
      // might trigger after we've stopped the video and done everything else
      showRabbitOnRoute = false;      
      stopYouTubeVideo();      
      rabbitMarker.remove();
      videoDisplayDiv.hidden = true;
    }

    // reset the highlightedRideID
    highlightedRideID = "";
  }
}