/* ###################################################################
   ****  DEFINE VARIOUS GLOBAL VARIABLES LIKE OUR MAP AND ZOOM SETTINGS ****
###################################################################### */

// these are the indexes (starting at 1 not 0) in the bikeRideJSONFileNames object/file
// for the rides we want to dislay on the map first  
// let initialRidesToDisplay = [1, 3, 7, 10];
let initialRidesToDisplay = [1, 3, 7, 8];

// this will be used to remember which ride is currently highlighted
// (meaning it was the last one to be clicked)
let highlightedRideID = "";


// ******************************************************************* 
// CREATE OUR LAYER CONTROL AND GET REFERENCE TO ITS HTML CONTAINER
//    "overlayLayerControl" layer is the L.control with checkboxes to hide/unhide rides on the map
//    we can add it to the map first with baseLayer and overlayLayer arguments set as "undefined"
//    then as we asyncronously read in the rideJSON files we will add the rides to it
// *******************************************************************  
let overlayLayerControl = L.control.layers(undefined, undefined, {
  // position: mapUISettings.overlayLayerCtl.position,
  collapsed: mapUISettings.overlayLayerCtl.collapsed
}).addTo(map);

// get a reference to the container/div for the layer control we created above
// we want to give this layer's div an ID so that we can style it and collapse/expand it
// we also want to give it classes that will allow us to collapse and expand it
let overlayLayerControlDiv = overlayLayerControl.getContainer();
overlayLayerControlDiv.setAttribute("id", "layer-control-div");
overlayLayerControlDiv.classList.add("collapse", "show");


// ******************************************************************* 
// CREATE CONTAINER LAYER FOR THE LAYER CONTROL
//    create a new Control Layer that we will use to contain the elevationControl on the map
// *******************************************************************  
let layerControlDisplayLayer = L.control({
  position: mapUISettings.overlayLayerCtl.position
});

// define the layer's onAdd function
layerControlDisplayLayer.onAdd = function(mymap){
  // get the div in our HTML that we've plan on using as 
  // the container for the layer control and it's title + show/hide button
  let div = L.DomUtil.get('layer-control-display-div');
  
  // append the overlayLayerControlDiv to it
  div.appendChild(overlayLayerControlDiv);
  
  return div;
};

// add the new layer to the map to create the div defined in the onAdd function
layerControlDisplayLayer.addTo(map)


// ******************************************************************* 
// POSITION THE ZOOM CONTROL
//    move the zoom control to the position specified in the mapUISettings object
// *******************************************************************  
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
      // CREATE A GEOJSON LAYER GROUP FOR THE 'rideJSON'
      //    ATTACH EVENT LISTENER FOR WHEN WE CLICK ON THE LAYER IN THE MAP
      //    ATTACH EVENT LISTENER FOR WHEN WE REMOVE THE LAYER FROM THE MAP (UNCHECK IT)
      // ****************************************************************************
      let geoJsonLayerGroup = createGeoJsonLayerGroupForRide(rideJSON, rideJSON.metadata);


      // called when a user clicks on any part of the geoJsonLayerGroup (Point, LineString, etc.)
      geoJsonLayerGroup.on('click dblclick', geoJsonLayerGroupClicked);

      // called when a user removes the layer from the map by unchecking the checkbox
      // contained in the overlayLayerControl 
      geoJsonLayerGroup.on('remove', geoJsonLayerGroupRemoved);
      
      // ****************************************************************************
      // ADD THE GEOJSON LAYER GROUP TO THE OVERLAY LAYER CONTROL
      // AND ADD TO THE MAP IF THE CURRENT INDEX MATCHES ONE IN THE "initialRidesToDisplay" ARRAY
      //    grab the ride's name from metadata and use as the display text in the layer control
      // ****************************************************************************

      // add the geoJsonLayerGroup to the layer control using the rides name as the display text      
      overlayLayerControl.addOverlay(geoJsonLayerGroup, rideJSON.metadata.rideName);
      
      // if the index matches one of those in the 'initialRidesToDisplay' array, add it to the map
      if(initialRidesToDisplay.includes(i+1)){
        geoJsonLayerGroup.addTo(map);
      }

      // if this is the last JSON file to load
      // update the layerControlDisplayLayer's container div to be a static width
      if(i >= bikeRideJSONFileNames.length - 1){
        let finalWidth = overlayLayerControlDiv.offsetWidth + 20;
        // let finalWidth = overlayLayerControlDiv.clientWidth + 20;
        // let finalWidth = overlayLayerControlDiv.scrollWidth + 20;

        layerControlDisplayLayer.getContainer().setAttribute("style", `width:${finalWidth}px`);
      }

  });
});



// *************************************************************
//  GEOJSON LAYER "on click dblclick" EVENT CALLBACK
// *************************************************************
function geoJsonLayerGroupClicked(event){

  // event.target gives us the entire GeoJSON Layer Group   
  let geoJsonLGroup = event.target;
  
  // we can use L.Util.stamp() to get its Leaflet Internal ID
  let clickedRideID = L.Util.stamp(geoJsonLGroup);

  if(highlightedRideID !== clickedRideID){
    
    let clickedRideMetadata = geoJsonLGroup.getMetadata();

    // displaySelectedRide(clickedRideID, geoJsonLGroup);
    displaySelectedRide(clickedRideMetadata, geoJsonLGroup);

    // if(ridesData[clickedRideID].metadata.hasBikeLapseSync){
    if(clickedRideMetadata.hasBikeLapseSync){  
      reCenterMap(geoJsonLGroup);
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
  // we can use L.Util.stamp() to get its Leaflet Internal ID
  let removedRideID = L.Util.stamp(event.target);
  // let removedRideID = event.target.getLayerId();

  if(removedRideID === highlightedRideID) {

    // hide the rideInfoDisplayDiv
    rideInfoDisplayDiv.hidden = true;

    // remove the elevationFollowMarkerLayer from the map and hide the elevationDisplayDiv
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