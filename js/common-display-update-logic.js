// #############################################################################
// *********  GLOBAL VARIABLES ***********************
// #############################################################################



// #############################################################################
// *********  DISPLAY SELECTED RIDE AND ASSOCIATED DATA ***********************
// #############################################################################
function displaySelectedRide(rideMetadata, geoJsonLGroup, allowHiddenVideoDisplayDiv = true){

  // *************************************************************
  //  GET REFERENCES TO THE RIDE METADATA AND LINESTRING
  // *************************************************************
  
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

  // if a follow marker layer already exists, we need to remove it, 
  // otherwise it will stay on the map forever
  if(elevationFollowMarkerLayer !== undefined){
    elevationFollowMarkerLayer.remove();
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
            "properties": null
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



// *****************************************************************
//     RE-CENTER/ZOOM THE MAP 
// *****************************************************************

/**
 * Recenter the map on the given geoJsonLayerGroup
 * 
 * @param {Object} geoJsonLayerGroup geoJson layer group (L.GeoJson object) to center on 
 */
function reCenterMap(geoJsonLGroup){

  let bounds = geoJsonLGroup.getBounds();

  let flyToBoundsOptions = {
    paddingTopLeft: flyToPaddingTopLeft,
    paddingBottomRight: flyToPaddingBottomRight,
    maxZoom: maximumZoom,
    animate: true,
    duration: 1
  }
  
  // this is supposed to animate the pan and zoom but doesn't always seem to do this
  map.flyToBounds(bounds, flyToBoundsOptions);


}


// #############################################################################
// *********  UTILITY FUNCTIONS ************************
// #############################################################################
/**
 * Get the feature 
 * who's .properties.name attribute is "featureName" and
 * who's .geometry.type attribute is "featureType"
 * from the layer that contains that feature in the layers array of the given geoJson layer group (L.GeoJson object)
 * 
 * @param {Object} geoJsonLayerGroup geoJson layer group (L.GeoJson object)
 * @param {String} featureName string that should match the .feature.properties.name attribute of one of the layers in the given geoJson Layer Group
 * @param {String} featureType string that should match the .feature.geometry.type attribute of one of the layers in the given geoJson Layer Group (should be one of the available feature types in the GeoJson spec)
 * @returns {Object} the requested GeoJson feature
 */
function getFeatureFromGeoJsonLayerGroup(geoJsonLayerGroup , featureName, featureType){

  let layer = geoJsonLayerGroup.getLayers().find ( (layer) => 
                                                          layer.feature.properties.name === featureName
                                                          && layer.feature.geometry.type === featureType
                                                        );
  return layer.feature;
  
}


/**
 * Get the LineString feature who's properties.name is "ROUTE" from the layer that contains it out of the given geoJson layer group (L.GeoJson object)
 * 
 * @param {Object} geoJsonLayerGroup geoJson layer group
 * @returns {Object} the requested GeoJson "LineString" feature
 */
function getROUTELineStringFeatureFromGeoJsonLayerGroup(geoJsonLayerGroup){

  return getFeatureFromGeoJsonLayerGroup(geoJsonLayerGroup , "ROUTE", "LineString");  
}





/**
 * get the feature from the features array of the given geoJson
 * who's geometry.type is "featureType" and
 * who's properties.name is "featureName"
 * 
 * @param {Object} geoJson geoJson object who's .features property is an array of features
 * @param {String} featureName string that should match one of the available features in the given geoJson's .features array
 * @param {String} featureType string that should match one of the available feature types in the GeoJson spec
 * @returns {Object} the requested GeoJson feature
 */
function getFeatureFromGeoJson(geoJson, featureName, featureType){

  return geoJson.features.find  ( (feature) => 
                                      feature.properties.name === featureName
                                      && feature.geometry.type === featureType
                                );
          
}




// get the LineString Feature from the Features array of the given geoJson object
// who's properties.name is "ROUTE" and geometry.type is "LineString"  
function getROUTELineStringFromGeoJson(geoJson){
  
  return getFeatureFromGeoJson(geoJson, "ROUTE", "LineString");
          
}


// get the LineString Feature from the Features array of the given geoJson object
// who's properties.name is "ROUTE" and geometry.type is "LineString"  
function getDETAILSPointFromGeoJson(geoJson){
  
  return getFeatureFromGeoJson(geoJson, "DETAILS", "Point");
          
}




// get the coordinates array of the ROUTE LineString Feature 
// from the Features array in the geoJson object
// by calling the above function and then just returning the coordinates
function getCoordsArrayOfROUTELineStringInGeoJson(geoJson){

  const routeLineString = getFeatureFromGeoJson(geoJson, "ROUTE", "LineString");

  return routeLineString.geometry.coordinates;

}



// get the LatLon of a Point feature in the Feature's array of a geoJson 
// who's name is "poinName" (@param 2)
// and geometry.type is "Point"
function getLatLonOfPointInGeoJson(geoJson, pointName){

  const point = getFeatureFromGeoJson(geoJson, pointName, "Point");

  // we need to only grab the first two items in the list and reverse them
  // this is because the geoJson stores coordinates as [lon, lat, ele]
  // and we want [lat, lon]
  const latLon = point.geometry.coordinates.slice(0, 2).reverse();
  
  return latLon;
}




// get the LatLon of a Point feature in the Feature's array of a geoJson 
// who's name is "poinName" (@param 2)
// and geometry.type is "Point"
function getLatLonArrayFromLineStringCoordsArray(lineStringCoordsArray){

  const reversedLineStringCoordsArray = lineStringCoordsArray.map((point) => {
      return point.slice(0, 2).reverse();
  });

  return reversedLineStringCoordsArray;
}




