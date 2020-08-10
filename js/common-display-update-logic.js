// #############################################################################
// *********  DISPLAY SELECTED RIDE AND ASSOCIATED DATA ***********************
// #############################################################################
function displaySelectedRide(rideID, geoJsonLGroup, allowHiddenVideoDisplayDiv = true){

  // *************************************************************
  //  GET REFERENCES TO THE RIDE METADATA AND LINESTRING
  // *************************************************************
  
  // get the metadata for the ride
  let rideMetadata = ridesData[rideID].metadata;

  // get the feature who's name is ROUTE and who's type is "LineString"
  // so we can use its coordinatesArray to create the elevationHighlightGeoJSON we'll use to create the elevationFollowMarkerLayer
  let lineStringFeature = getROUTELineStringFeatureFromGeoJsonLayerGroup(geoJsonLGroup);


  // *************************************************************
  //  UPDATE THE ELEVATION DISPLAY
  // *************************************************************
  showElevationForLineStringFeature(lineStringFeature);

  // make sure the div that contains the elevationControl display is not hidden
  elevationDisplayDiv.hidden = false;

  // *************************************************************
  //  UPDATE THE YOUTUBE VIDEO PLAYER / RABBIT MARKER
  // *************************************************************
  
  // returns true if the youTubeVideoID is not an empty string
  let youTubeVideoID = rideMetadata.youTubeVideoID;
  let hasValidVideoID = (youTubeVideoID !== "");

  // lets us know if this video is syncronized BikeLapse style (meaning it needs a rabbit)
  let hasBikeLapseSync = rideMetadata.hasBikeLapseSync;
  showRabbitOnRoute = (typeof(hasBikeLapseSync) !== undefined) ? hasBikeLapseSync : false;

  // console.log("video has BLS?", showRabbitOnRoute);

  // if the video exists and it has BikeLapse Sync
  // re-set the rabbitCoordsArray with the coordinates from the new ride
  // and set the rabbit marker to the start of the ride
  if(hasValidVideoID && showRabbitOnRoute){ 
    rabbitCoordsArray = lineStringFeature.geometry.coordinates;
  }    
  else {
    rabbitCoordsArray = undefined;
    rabbitMarker.remove();
  }


  // load the youtube video and initialize the rabbit
  if(hasValidVideoID){
    // the youTube player needs to know if the video has bikeLapse sync
    loadYouTubeVideo(youTubeVideoID);
  }    

  // set the visibility of the videoDisplayDiv according to "hasValidVideoID" and if we are allowing the videoDisplayDiv to be hidden or not
  videoDisplayDiv.hidden = !hasValidVideoID && allowHiddenVideoDisplayDiv;

}
  
  
  

// #############################################################################
// *********  ELEVATION DISPLAY FUNCIONS ********************************
// #############################################################################
// This function manages the adding and removing of the
// elevation control display and highlight geojson overlay layer
function showElevationForLineStringFeature(lineStringFeature){

  // clear the display on the elevationControl
  elevationControl.clear();

  // if a highlight layer already exists, we need to remove it, 
  // otherwise it will stay on the map forever
  if(elevationFollowMarkerLayer !== undefined){
    elevationFollowMarkerLayer.remove();
    // elevationFollowMarkerLayer.clearLayers();
  }

  let elevationFollowMarkerGeoJSON = {
    "name":"HighlightLayerOverlay",
    "type":"FeatureCollection",
    "features":[
        {
            "name": "HIGHLIGHT_ROUTE",
            "type":"Feature",
            "geometry": {
                "type":"LineString",
                "coordinates": lineStringFeature.geometry.coordinates
            },
            "properties":null
        }
    ]
  };        

  // assign a new geoJson layer with the 'elevationFollowMarkerGeoJSON' data to the 'elevationFollowMarkerLayer' object
  // this also adds the data to display in the elevationControl
  elevationFollowMarkerLayer = L.geoJson(elevationFollowMarkerGeoJSON,{
    onEachFeature: elevationControl.addData.bind(elevationControl),
    style: { 
      fillOpacity: 0.0, 
      weight: routeLineProperties.selected.lineWeight, 
      opacity: 1, 
      color: routeLineProperties.selected.lineColor
    }
  });

  // add the highlight layer to the map
  elevationFollowMarkerLayer.addTo(map);


}



// ****************************************************************
//     VARIOUS HELPER FUNCTIONS
// ****************************************************************
// get the LineString Feature from the Layers array 
// of the L.GeoJson object
// we pass in the array of layers, each of which has a "feature" object in it
// along with all of the other information associated with that layer
// this feature object is one of the features from our original GeoJSON object 
function getROUTELineStringFeatureFromGeoJsonLayerGroup(geoJsonLGroup){
  
  let lineStringLayer = geoJsonLGroup.getLayers().find ( (layer) => 
                                                          layer.feature.properties.name === "ROUTE"
                                                          && layer.feature.geometry.type === "LineString"
                                                        );
  return lineStringLayer.feature;
  
}

// *****************************************************************
//     RE-CENTER/ZOOM THE MAP WITH THE DETAILS POINT AS THE CENTER
// *****************************************************************

function reCenterMap(rideIDtoCenterOn){
  // get the latlon of the DETAILS point in the Features array of the GeoJSON
  let centerLatLon = getLatLonOfPointInGeoJson(ridesData[rideIDtoCenterOn], "DETAILS");
  
  // this is supposed to animate the pan and zoom but doesn't always seem to do this
  map.flyTo(centerLatLon, defaultRideViewZoom, {animate: true, duration: 1});
}


function reCenterMapWithBounds(geoJsonLGroup){

  let bounds = geoJsonLGroup.getBounds();

  let boundsOptions = {
    paddingTopLeft: paddingTopLeft,
    paddingBottomRight: paddingBottomRight,
    maxZoom: maximumZoom,
    animate: true,
    duration: 1
  }
  
  // this is supposed to animate the pan and zoom but doesn't always seem to do this
  map.flyToBounds(bounds, boundsOptions);
}



// #############################################################################
// *********  RABBIT DISPLAY FUNCTION ************************
// #############################################################################

function syncRabbitMarkerToVideo(valType, value){

  let latlon;

  // get the latlon from the coordsArray based on the
  // value type that is passed in
  switch(valType){
      case "latlon":
          latlon = value;
          break;
      // notice we don't use a break for "percentWatched" 
      // because we also want the logic from "frameIndex" to be executed
      case "percentWatched":
          value = Math.round(value * rabbitCoordsArray.length);
      case "frameIndex":
          let frameIndex = (value < rabbitCoordsArray.length) ? value : rabbitCoordsArray.length - 1;
          latlon = rabbitCoordsArray[frameIndex].slice(0, 2).reverse();
          break;
  }

  // set the latlon of the rabbitMarker
  rabbitMarker.setLatLng(latlon);

  // if the rabbitMarker isn't visible, make it so
  if(!map.hasLayer(rabbitMarker)) {
    rabbitMarker.addTo(map);
  }

}

// simple method to print out the rabbit Marker object for debugging
function getRabbitCoords(){    
  return rabbitMarker._latlng;
}


