/* ###################################################################
   ****  DEFINE VARIOUS GLOBAL VARIABLES LIKE OUR MAP AND ZOOM SETTINGS ****
###################################################################### */

// these are the indexes (starting at 1 not 0) in the bikeRideJSONFileNames object/file
// for the rides we want to dislay on the map first  
// let _initialRidesToDisplay = [10];
let _initialRidesToDisplay = [1, 3, 7, 10, 11];
// let _initialRidesToDisplay = [1, 3, 7, 8];

// this is the value for our static width of the Elevation Control's display container
// when we show/hide the elevationControl itself, we don't want the width
// of the container it's in to change so that's why we have to set it to be
const _elevationDisplayDivWidth = `${550 * windowScaleFactor}px`;

// this will set our rabbit to have the popup intro message
showRabbitIntroPopupMessage = true;

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

// ******************************************************************* 
// SET STATIC WIDTH FOR ELEVATION CONTROL DISPLAY DIV
//    since we have a button to show/hide the elevation control
//    we need to make sure that when we hide it...
//    the div that contains it does not shrink
// *******************************************************************
document.getElementById("elevation-display-div").style.width = _elevationDisplayDivWidth;


/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAYS ELEMENTS ****
################################################################################## */
initializeBaseMaps();
initializeMapOverlaysAndUI();

// this will make sure that the zoom control stacks on top of the legend
map.zoomControl.remove();
map.zoomControl.addTo(map);

// asyncronous counter that will trigger a callback to update the "All Rides" layercontrol once all rides have been added
// updates the layerControlDisplayLayer's container div to be a static width
// we do this so that when we hide the overlayLayerControl's div with our "hide" button
// we don't want the size of the layerControlDisplayLayer container to shrink
let rideJSONsFetchedCounter = new AsyncCounter(bikeRideJSONFileNames.length, function(){

        // get the HTML container Div for the layerControlDisplayLayer
        let layerControlDisplayDiv = layerControlDisplayLayer.getContainer();

        // grab a reference to its current offsetWidth
        let staticWidth = layerControlDisplayDiv.offsetWidth;

        // make this the minWidth for eternity
        layerControlDisplayDiv.style.minWidth = `${staticWidth}px`;

        // if the windowScaleFactor is less than 1, then we should automatically collapse the layer control div with our rides in it
        if(windowScaleFactor < 1){
          showHideCollapsableDivByID_JQuery("layer-control-div", "hide");
        }
});

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
      // AND ADD TO THE MAP IF THE CURRENT INDEX MATCHES ONE IN THE "_initialRidesToDisplay" ARRAY
      //    grab the ride's name from metadata and use as the display text in the layer control
      // ****************************************************************************

      // add the geoJsonLayerGroup to the layer control using the rides name as the display text      
      overlayLayerControl.addOverlay(geoJsonLayerGroup, rideJSON.metadata.rideName);
      
      // if the index matches one of those in the '_initialRidesToDisplay' array, add it to the map
      if(_initialRidesToDisplay.includes(i+1)){
        geoJsonLayerGroup.addTo(map);
      }

      // update the async counter each ride
      rideJSONsFetchedCounter.increment();

  });
});



// *************************************************************
//  GEOJSON LAYER "on click dblclick" EVENT CALLBACK
// *************************************************************
function geoJsonLayerGroupClicked(event){

  // event.target gives us the entire GeoJSON Layer Group   
  let geoJsonLGroup = event.target;
  
  // we can use L.Util.stamp() to get its Leaflet Internal ID
  let clickedLayerID = L.Util.stamp(geoJsonLGroup);

  if(getSelectedLayerID() !== clickedLayerID){

    let clickedRideMetadata = geoJsonLGroup.getMetadata();

    // displaySelectedRide(clickedLayerID, geoJsonLGroup);
    displaySelectedRide(clickedRideMetadata, geoJsonLGroup);

    // if the ride has bikelapse, zoom in on it, set the frameoffset, and set/modify the rabbit popup
    if(clickedRideMetadata.hasBikeLapseSync){  
      reCenterMap(geoJsonLGroup);
    
      // set the frameOffset for the current ride (yt class will handle if it is undefined)
      yt_setFrameOffset(clickedRideMetadata.frameOffset, allowOffsetOutsideTolerance);

    }
    else{
      yt_setFrameOffset(undefined);
    }

    // lastly, set our selectedLayerID to the clickedLayerID
    // setSelectedLayerID(clickedLayerID);
  }
  else{
    //console.log('clicked on ride with same "selectedLayerID" as before: ', getSelectedLayerID()); 

    const hasBikeLapseSync = geoJsonLGroup.getMetadata().hasBikeLapseSync;        
    
    const featureName = event.layer.feature.properties.name 

    if(hasBikeLapseSync && (featureName === "ROUTE" || featureName === "DETAILS")){

      const frameIndex = findROUTELinestringCoordsIndexFromLatLon(geoJsonLGroup, event.latlng);
  
      yt_seekToTimeFromFrameIndex(frameIndex);
    }

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
  let removedLayerID = L.Util.stamp(event.target);
  // let removedLayerID = event.target.getLayerId();

  if(removedLayerID === getSelectedLayerID()) {

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
      yt_stopYouTubeVideo();
      yt_setFrameOffset(undefined);      
      rabbitMarker.remove();
      videoDisplayDiv.hidden = true;
    }

    // reset the selectedLayerID
    clearSelectedLayerID();
  }
}