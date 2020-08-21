// #############################################################################
// *********  GLOBAL VARIABLES ***********************
// #############################################################################
if(document.getElementById('distance-tot')){
  var distTotDiv       = document.getElementById('distance-tot').getElementsByClassName("stat-text")[0];
  var elevTotDiv       = document.getElementById('elevation-tot').getElementsByClassName("stat-text")[0];
  var durMovingTotDiv  = document.getElementById('duration-moving-tot').getElementsByClassName("stat-text")[0];
  var spdMovingAvgDiv  = document.getElementById('speed-moving-avg').getElementsByClassName("stat-text")[0];
}

// RIDE STATS DISPLAY
if(document.getElementById('ride-stats-cumulative')){
  // store a refrence to a JQuery object for the DIV in our HTML with id="#ride-stats-cumulative"
  // this is the only time in our entire program that we are going to use JQuery because Bootstrap requires it
  var rideStatsCumRow_JQ = $("#ride-stats-cumulative");

  // all of our elements in the cumulative ride stats display section
  var distCumDiv      = document.getElementById('distance-cum').getElementsByClassName("stat-text")[0];
  var elevCumDiv      = document.getElementById('elevation-cum').getElementsByClassName("stat-text")[0];
  var durMovingCumDiv = document.getElementById('duration-moving-cum').getElementsByClassName("stat-text")[0];
  var spdMovingNowDiv = document.getElementById('speed-moving-now').getElementsByClassName("stat-text")[0];
}


let cumulativeRideStats;



// ################################################################################
// *********  DISPLAY SELECTED RIDE AND ASSOCIATED DATA *************************
// ################################################################################
function displaySelectedRide(rideMetadata, geoJsonLGroup, allowVideoDisplayDivToBeHidden = true){

  // ****************************************************************************
  //  GET REFERENCE TO THE ROUTE LINESTRING
  // ****************************************************************************
  
  // get the feature who's name is ROUTE and who's type is "LineString"
  // so we can use its coordinatesArray to create the elevationHighlightGeoJSON we'll use to create the elevationFollowMarkerLayer
  let lineStringFeature = getFeatureFromGeoJsonLayerGroup(geoJsonLGroup , "ROUTE", "LineString");



  // ****************************************************************************
  //  UPDATE THE RIDE INFO DISPLAY
  // ****************************************************************************

  let rideStats = rideMetadata.rideStats;

  if(distTotDiv){
    distTotDiv.textContent      = `${rideStats.distance.mi} mi`;
    elevTotDiv.textContent      = `${rideStats.elevation.gain.ft} ft`;
    durMovingTotDiv.textContent = `${getFormattedDurationStringFromISO(rideStats.duration.moving)}`;
    spdMovingAvgDiv.textContent = `${rideStats.avgSpeed.moving.mph} mph`;
  }

  // ****************************************************************************
  //  UPDATE THE ELEVATION DISPLAY
  // ****************************************************************************
  showElevationForLineStringFeature(lineStringFeature);

  // make sure the div that contains the elevationControl display is not hidden
  elevationDisplayDiv.hidden = false;




  // ****************************************************************************
  //  UPDATE THE YOUTUBE VIDEO PLAYER / RABBIT MARKER / CUMULATIVE RIDE STATS
  // ****************************************************************************
  
  // returns true if the youTubeVideoID is not an empty string
  // (probably need a better validation method)
  let youTubeVideoID = rideMetadata.youTubeVideoID;
  let hasValidVideoID = (youTubeVideoID !== "");

  // lets us know if this video is syncronized BikeLapse style (meaning it needs a rabbit)
  let hasBikeLapseSync = rideMetadata.hasBikeLapseSync;
  showRabbitOnRoute = (typeof(hasBikeLapseSync) !== "undefined") ? hasBikeLapseSync : false;

  // if the video exists and it has BikeLapse Sync
  // re-set the rabbitCoordsArray with the coordinates from the new ride
  // and set the rabbit marker to the start of the ride
  // also, show the rideStats section under the video
  if(hasValidVideoID && showRabbitOnRoute){ 
    rabbitCoordsArray = lineStringFeature.geometry.coordinates;
    if(rideStatsCumRow_JQ){
      rideStatsCumRow_JQ.collapse('show');

      cumulativeRideStats = getCumulativeStatsArrayFromLineString(lineStringFeature, "moving");
    }
  }    
  else {
    showRabbitOnRoute = false;
    rabbitCoordsArray = undefined;
    rabbitMarker.remove();
    if(rideStatsCumRow_JQ){
      rideStatsCumRow_JQ.collapse('hide');
      cumulativeRideStats = undefined;
    }    
  }


  // if the video ID is valid (probably need a better validation method)
  if(hasValidVideoID){
    // load the youtube video
    loadYouTubeVideo(youTubeVideoID);
  }
  else{
    // reset the video player with an empty video
    loadYouTubeVideo("");    
  }

  // set the visibility of the videoDisplayDiv according to "hasValidVideoID" and if we are allowing the videoDisplayDiv to be hidden or not
  videoDisplayDiv.hidden = !hasValidVideoID && allowVideoDisplayDivToBeHidden;

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
// *********  RABBIT DISPLAY UPDATE FUNCTION ************************
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


// #############################################################################
// *********  RIDE STATS DISPLAY UPDATE FUNCTION ************************
// #############################################################################

function syncCumulativeRideStatsToVideo(valType, value){

  let eleContDataAtIndex;
  let elevationControlData = elevationControl.getData();

  let cumStatsDataAtIndex;


  // console.log(elevationControlData);

  // get the latlon from the coordsArray based on the
  // value type that is passed in
  switch(valType){
    // notice we don't use a break for "percentWatched" 
    // because we also want the logic from "frameIndex" to be executed
    case "percentWatched":
        value = Math.round(value * elevationControlData.length);
    case "frameIndex":
        let frameIndex = (value < elevationControlData.length) ? value : elevationControlData.length - 1;
        eleContDataAtIndex = elevationControlData[frameIndex];
        cumStatsDataAtIndex = cumulativeRideStats[frameIndex];
        break;
  }

  if(distCumDiv){
    distCumDiv.textContent      = eleContDataAtIndex.dist.toFixed(2);
    elevCumDiv.textContent      = eleContDataAtIndex.altitude.toFixed(0);
    durMovingCumDiv.textContent = getFormattedDurationStringFromISO(cumStatsDataAtIndex.duration);
    spdMovingNowDiv.textContent = _toMiles(cumStatsDataAtIndex.speed, 2);
  }

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


// this function is temporarily going to live here
// once we update all of the rides to have the proper metadata,
// we can move it to a more appropriate location (like geojson-tools)
function getFormattedDurationStringFromISO(isoDuration){

  let duration = moment.duration(isoDuration);

  // use the minutes and seconds to create a string that is formatted as "[minutes] minutes, and [seconds] seconds"
  let durationString = duration.minutes() + "m "  + duration.seconds() + "s";

  // if the duration lasted more than 1 hour, pre-pend the string with "[hours] hours, "
  if(duration.hours() > 0){
    durationString = duration.hours() + "h " + durationString;
  }

  return durationString;
}





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




