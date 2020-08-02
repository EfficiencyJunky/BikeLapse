/* ###################################################################
   ****  DEFINE VARIOUS GLOBAL VARIABLES LIKE OUR MAP AND ZOOM SETTINGS ****
###################################################################### */
let initialRideIDsToDisplay = ["ride0001", "ride0003"];

let overlayLayerControl = L.control.layers(undefined, undefined, {
  collapsed: mapUISettings.overlayLayerCtl.collapsed,
  position: mapUISettings.overlayLayerCtl.position
}).addTo(map);

// move the zoom control to the top left
map.zoomControl.setPosition(mapUISettings.zoomCtl.position);


/* ###############################################################################
   ****  INITIALIZE OUR MAP WITH AVAILABLE BASEMAPS AND UI OVERLAYS ELEMENTS ****
################################################################################## */
initializeMap();


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
      //    WE'LL USE TO CREATE THE GEOJSON
      // ****************************************************************************

      // create a new rideID that gets incremented by 1 for each file we read in
      // this way we can store the rideJSONs by rideID and not file name
      let newRideID = "ride" + pad(i+1, 4);

      // set the global variable "currentRideID" to be the rideID for this ride
      // this global variable will be used to access the correct data for this ride
      // in the 'filter', 'pointToLayer', 'onEachFeature', and 'style'
      // functions used to create the geoJson layer below
      currentRideID = newRideID;
      
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
      let geoJsonLayer = L.geoJson(rideJSON, { 
                                                pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                filter: filterFunction,
                                                pointToLayer: pointToLayerFunction,
                                                onEachFeature: onEachFeatureFunction,
                                                style: styleFunction
                                                // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: rideMetadata.lineColor}
                                              });

      // when we click on the layer, we want to show the elevation data
      // by adding it to the elevation control layer
      geoJsonLayer.on('click dblclick', function(event) {

        let clickedRideID = event.target.getLayers()[0].feature.properties.rideID;
        // let clickedRideID = event.layer.feature.properties.rideID; // does the same thing as the one above
        showElevationForRideID(clickedRideID);
      });

      // when we remove a layer we want to check and see if it is currently being used
      // to display its elevation in the elevation control layer.
      // if it is, we want to clear and remove the elevation display as well
      geoJsonLayer.on('remove',function(event){
        // the target is the GeoJSON LayerGroup 
        // so we just grab the first layer in the group with [0]
        // and then get its rideID
        let removedRideID = event.target.getLayers()[0].feature.properties.rideID;
        
        if(removedRideID === elevationRideID) {
          clearElevationDisplay("remove");
        }
      });


      // ****************************************************************************
      // ADD THE GEOJSON LAYER TO THE LAYER CONTROL
      // AND ADD TO THE MAP IF THE RIDE ID MATCHES ONE OF THE RIDE IDS IN THE 
      //    using the ride's name as the display text in the layer control
      // ****************************************************************************

      // add the geoJsonLayer to the layer control using the rides name as the display text      
      
      overlayLayerControl.addOverlay(geoJsonLayer, rideJSON.metadata.rideName);
      
      // if the ride id matches one of those in the 'initialRideIDsToDisplay' array, add it to the map
      if(initialRideIDsToDisplay.includes(currentRideID)){
        geoJsonLayer.addTo(map);
      }

  });

});