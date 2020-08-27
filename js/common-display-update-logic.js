// #############################################################################
// *********  "Private" CLASS VARIABLES  ***********************
// #############################################################################
// this will be used to remember which ride is currently selected
// (meaning it was the last one to be clicked)
let _selectedLayerID = "";

// this is the metadata the currently selected ride
let _selectedMetadata;

// this is the LineString for the currently selected ride
let _selectedLineStringFeature;

// this is the cumulative ride stats calculated from the lineString of the currently selected ride
let _cumulativeRideStats;

// ******************************************************************
//  RIDE INFO AND RIDE STATS UI ELEMENT REFERENCES
// ******************************************************************
// RIDE INFO AND TOTAL STATS DISPLAY
if(document.getElementById('ride-info-parent')){
  var rideNameDiv      = document.getElementById('ride-name');
  var startTimeDiv     = document.getElementById('ride-start-datetime');
  var stravaURLDiv     = document.getElementById('ride-strava-url');
  var googleMapURLDiv  = document.getElementById('ride-googlemap-url');


  var distanceTotalDiv        = document.getElementById('distance-tot').getElementsByClassName("stat-tot-text")[0];
  var elevationTotalDiv       = document.getElementById('elevation-tot').getElementsByClassName("stat-tot-text")[0];
  var durationMovingTotalDiv  = document.getElementById('duration-moving-tot').getElementsByClassName("stat-tot-text")[0];
  var speedMovingAvgDiv       = document.getElementById('speed-moving-avg').getElementsByClassName("stat-tot-text")[0];
}

// CUMULATIVE RIDE STATS DISPLAY
if(document.getElementById('ride-stats-cumulative')){


  // all of our elements in the cumulative ride stats display section
  var distanceCumDiv      = document.getElementById('distance-cum').getElementsByClassName("stat-cum-text")[0];
  var elevationCumDiv      = document.getElementById('elevation-cum').getElementsByClassName("stat-cum-text")[0];
  var durationMovingCumDiv = document.getElementById('duration-moving-cum').getElementsByClassName("stat-cum-text")[0];
  var speedMovingNowDiv = document.getElementById('speed-moving-now').getElementsByClassName("stat-cum-text")[0];
}




// ******************************************************************
//  UNITS RADIO BUTTON "onchange" HANDLER
// ******************************************************************
// onchange handler for the units toggle radio buttons 
// LOCATED IN OUR LEGEND
// updates all the UI elements that display units
function dl_handleUnitsRadioButtonChanges(event){
  
  // grab the value of the button that was clicked and assign to our global displayUnits
  displayUnits = event.target.value;

  // we always want to update the elevationControl to display proper units
  // here we set the units using our extension method created in leafelet-functions.js
  elevationControl.setUnits(displayUnits);

  // check to see if a ride is selected or not
  // if no ride is selected there's no point in doing any of this
  if(_selectedLayerID !== ""){
    
    // reset the elevation control by calling this function
    showElevationForLineStringFeature(_selectedLineStringFeature);

    // now update the ride stats in the Ride Info "total" display
    let rideStats = _selectedMetadata.rideStats;
      
    if(displayUnits === "metric"){
      distanceTotalDiv.textContent  = `${rideStats.distance.km.toFixed(2)} km`;
      elevationTotalDiv.textContent = `${rideStats.elevation.gain.m.toFixed(0)} m`;
      speedMovingAvgDiv.textContent = `${rideStats.avgSpeed.moving.kph.toFixed(2)} kph`;
    }
    else{
      distanceTotalDiv.textContent  = `${rideStats.distance.mi.toFixed(2)} mi`;
      elevationTotalDiv.textContent = `${rideStats.elevation.gain.ft.toFixed(0)} ft`;
      speedMovingAvgDiv.textContent = `${rideStats.avgSpeed.moving.mph.toFixed(2)} mph`;
    }

    // if this ride hasBikeLapseSync then we should also update the cumulative section
    if(_selectedMetadata.hasBikeLapseSync){
      let frameIndex = yt_getFrameIndexFromVideoTime();
      syncCumulativeRideStatsToVideo("frameIndex", frameIndex);
    }
  }
  else{
    // just update the elevationcontro
    
  }


}






// ################################################################################
// *********  MAIN DISPLAY UPDATE FUNCTIONS *************************
// ################################################################################

// ******************************************************************
//  DISPLAY SELECTED RIDE AND ASSOCIATED DATA
// ******************************************************************
function displaySelectedRide(rideMetadata, geoJsonLGroup, allowVideoDisplayDivToBeHidden = true, ){

  // first we need to stop the Rabbit/Slider Syncronizer
  // otherwise, it could update a few times before the next video is loaded
  // which would cause a number of issues displaying the rabbit
  yt_stopRabbitAndSliderSyncronizer();


  // ****************************************************************************
  //  GET REFERENCE TO THE SELECTED LAYER ID AND METADATA
  //      this gets used for updating ride details in the UI
  // ****************************************************************************
  _selectedLayerID = L.Util.stamp(geoJsonLGroup);
  _selectedMetadata = rideMetadata;


  // ****************************************************************************
  //  GET REFERENCE TO THE ROUTE LINESTRING
  // ****************************************************************************
  // get the feature who's name is ROUTE and who's type is "LineString"
  // so we can use its coordinatesArray to create the elevationHighlightGeoJSON we'll use to create the elevationFollowMarkerLayer
  _selectedLineStringFeature = getFeatureFromGeoJsonLayerGroup(geoJsonLGroup , "ROUTE", "LineString");



  // ****************************************************************************
  //  RIDE INFO DISPLAY UPDATE
  // ****************************************************************************
  if(document.getElementById('ride-info-parent')){

    // ********  THIS IS HOW WE CAN SWITCH BETWEEN CALCULATING RIDE STATS ******
    // the top option grabs it from the ride's metadata
    // the bottom option does the calculations from the route Linestring
    let rideStats = rideMetadata.rideStats;
    // let rideStats = getRideStats(_selectedLineStringFeature);
    // abracadabra


    // update ride name display
    if(rideMetadata.rideName !== ""){
      rideNameDiv.textContent   = `${rideMetadata.rideName}`;
    }
    else{
      rideNameDiv.textContent = "!! no ride name given !!"
    }

    // update date/time display
    startTimeDiv.textContent = `${getFormattedDateTimeStringFromISO(_selectedLineStringFeature.properties.time)}`;

    // update Strava URL display
    stravaURLDiv.hidden = (rideMetadata.stravaURL === "");
    stravaURLDiv.href = rideMetadata.stravaURL;
    
    // update Google Map URL display
    googleMapURLDiv.hidden = (rideMetadata.googleMapURL === "");
    googleMapURLDiv.href = rideMetadata.googleMapURL;
    
    // update all the ride stats
    if(rideStats !== undefined){
      durationMovingTotalDiv.textContent = `${getFormattedDurationStringFromISO(rideStats.duration.moving, "longform")}`;

      if(displayUnits === "metric"){
        distanceTotalDiv.textContent  = `${rideStats.distance.km.toFixed(2)} km`;
        elevationTotalDiv.textContent = `${rideStats.elevation.gain.m.toFixed(0)} m`;
        speedMovingAvgDiv.textContent = `${rideStats.avgSpeed.moving.kph.toFixed(2)} kph`;
      }
      else{
        distanceTotalDiv.textContent  = `${rideStats.distance.mi.toFixed(2)} mi`;
        elevationTotalDiv.textContent = `${rideStats.elevation.gain.ft.toFixed(0)} ft`;
        speedMovingAvgDiv.textContent = `${rideStats.avgSpeed.moving.mph.toFixed(2)} mph`;
      }
    }
    else{
      distanceTotalDiv.textContent = elevationTotalDiv.textContent = durationMovingTotalDiv.textContent = speedMovingAvgDiv.textContent = 0;
    }
  }

  
  // make sure the div that contains the rideInfo display is not hidden
  rideInfoDisplayDiv.hidden = false;
  
  
  // ****************************************************************************
  //  UPDATE THE ELEVATION DISPLAY
  // ****************************************************************************
  showElevationForLineStringFeature(_selectedLineStringFeature);
  
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
  // initialize the rabbit
  // also, update and initialize (show) the rideStats section under the video
  if(hasValidVideoID && showRabbitOnRoute){
    
    rabbitCoordsArray = _selectedLineStringFeature.geometry.coordinates;
    _cumulativeRideStats = getCumulativeStatsArrayFromLineString(_selectedLineStringFeature, "moving");

    initializeRabbitMarker(rabbitCoordsArray[0]);
    initializeCumulativeRideStatsDisplay(_cumulativeRideStats[0]);

  }    
  else {
    showRabbitOnRoute = false;
    rabbitCoordsArray = undefined;
    rabbitMarker.remove();

    _cumulativeRideStats = undefined;

    showHideCollapsableDivByID_JQuery("ride-stats-cumulative", "hide");

  }



  // if the video ID is valid (probably need a better validation method)
  if(hasValidVideoID){
    // load the youtube video
    yt_loadYouTubeVideo(youTubeVideoID);
  }
  else{
    // reset the video player with an empty video
    yt_loadYouTubeVideo("");    
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







// #############################################################################
// *********  RABBIT DISPLAY UPDATE FUNCTIONS ************************
// #############################################################################

// ********************************************************************************
// this gets called by the "youtube-logic.js" when the video loads and as it plays
// ********************************************************************************
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

}

// ****************************************************************
// simple method to initialize the rabbit at the given geoJson coords
// ****************************************************************
function initializeRabbitMarker(coord){    

  const coordLatLon = {
    "lat": coord[1],
    "lng": coord[0],
   };

  rabbitMarker.setLatLng(coordLatLon);

  // if the rabbitMarker isn't visible, make it so
  if(!map.hasLayer(rabbitMarker)) {
    rabbitMarker.addTo(map);
  }  

  // if the rabbit marker has a popup, open it
  if(rabbitMarker.getPopup()){
    rabbitMarker.openPopup();
    // console.log("opening popup");
  }

}





// HELPER METHOD NOT IN USE
// simple method to print out the rabbit Marker object for debugging
function getRabbitCoords(){    
  return rabbitMarker._latlng;
}








// #############################################################################
// *********  RIDE STATS DISPLAY UPDATE FUNCTION ************************
// #############################################################################
// valType will tell us if we're sending in the "percentageWatched" or "frameIndex"
// the value will be either the percentage float or the frameIndex int
function syncCumulativeRideStatsToVideo(valType, value){

  let cumulativeStatsAtIndex;

  // get the frameIndex and the cumulativeStatsAtIndex based on the value type that is passed in
  switch(valType){
    // notice we don't use a break for "percentWatched" 
    // because we also want the logic from "frameIndex" to be executed
    case "percentWatched":
        value = Math.round(value * _cumulativeRideStats.length);
    case "frameIndex":
        let frameIndex = (value < _cumulativeRideStats.length) ? value : _cumulativeRideStats.length - 1;
        cumulativeStatsAtIndex = _cumulativeRideStats[frameIndex];
        break;
  }

  // if the ride-stats-cumulative HTML Div actually exists...
  if(document.getElementById('ride-stats-cumulative')){

    durationMovingCumDiv.textContent = getFormattedDurationStringFromISO(cumulativeStatsAtIndex.duration);

    if(displayUnits === "metric"){
      distanceCumDiv.textContent    = `${(cumulativeStatsAtIndex.distance / 1000).toFixed(2)} km`;
      elevationCumDiv.textContent   = `${cumulativeStatsAtIndex.elevation.toFixed(0)} m`;
      speedMovingNowDiv.textContent = `${cumulativeStatsAtIndex.speed.toFixed(2)} kph`;
    }
    else{
      distanceCumDiv.textContent    = `${_toMiles(cumulativeStatsAtIndex.distance / 1000).toFixed(2)} mi`;
      elevationCumDiv.textContent   = `${_toFeet(cumulativeStatsAtIndex.elevation, 0)} ft`;
      speedMovingNowDiv.textContent = `${_toMiles(cumulativeStatsAtIndex.speed).toFixed(2)} mph`;
    }
  }

}



function initializeCumulativeRideStatsDisplay(cumulativeStatsToDisplay){

  // console.log(cumulativeStatsToDisplay);
  // if the ride-stats-cumulative HTML Div actually exists...
  if(document.getElementById('ride-stats-cumulative')){

    durationMovingCumDiv.textContent = getFormattedDurationStringFromISO(cumulativeStatsToDisplay.duration);

    if(displayUnits === "metric"){
      distanceCumDiv.textContent    = `${(cumulativeStatsToDisplay.distance / 1000).toFixed(2)} km`;
      elevationCumDiv.textContent   = `${cumulativeStatsToDisplay.elevation.toFixed(0)} m`;
      speedMovingNowDiv.textContent = `${cumulativeStatsToDisplay.speed.toFixed(2)} kph`;
    }
    else{
      distanceCumDiv.textContent    = `${_toMiles(cumulativeStatsToDisplay.distance / 1000).toFixed(2)} mi`;
      elevationCumDiv.textContent   = `${_toFeet(cumulativeStatsToDisplay.elevation, 0)} ft`;
      speedMovingNowDiv.textContent = `${_toMiles(cumulativeStatsToDisplay.speed).toFixed(2)} mph`;
    }
  }

  // if the rideStatsRow exists, make it visible and get the cumulative ride stats to show in it
  showHideCollapsableDivByID_JQuery("ride-stats-cumulative", "show");

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
// *********  GETTERS AND SETTERS ************************
//   Eventually I would like to make these files more classlike
//   this is an early attempt at doing that
// #############################################################################

function getSelectedLayerID(){

  return _selectedLayerID;
}


function getSelectedLayerID(){

  return _selectedLayerID;
}

function clearSelectedLayerID(){
  _selectedLayerID = "";
}


function setSelectedLayerID(newLayerID){
  _selectedLayerID = newLayerID;
}



// #############################################################################
// *********  UTILITY FUNCTIONS ************************
// #############################################################################

// OUR ONLY JQUERY FUNCTION IN THE ENTIRE PROGRAM
// this is the only place in our entire program that we are going to use JQuery because Bootstrap requires it
function showHideCollapsableDivByID_JQuery(divID, showHide){
  // store a refrence to a JQuery object for the DIV in our HTML with id="#"+divID
  let divToShowHide = $("#" + divID);

  if(divToShowHide){
    divToShowHide.collapse(showHide);      
  }

}







// this function is temporarily going to live here
// once we update all of the rides to have the proper metadata,
// we can move it to a more appropriate location (like geojson-tools)
function getFormattedDurationStringFromISO(isoDuration, displayStyle = "stopwatch"){

  let duration = moment.duration(isoDuration);

  let durationString = "";

  // use the duration to create a string formatted as "mm:ss" (or "hh:mm:ss") if it has hours
  if(displayStyle === "stopwatch"){

    durationString = String(duration.minutes()).padStart(2,'0') + ":" +
                     String(duration.seconds()).padStart(2,'0');
    
    // if the duration lasted more than 1 hour, pre-pend the string with "hh:"
    if(duration.hours() > 0){
      durationString = String(duration.hours()).padStart(2,'0') + ":" + durationString;
    }
  }
  // use the duration to create a string formatted as "[mm] minutes, and [ss] seconds" (or "[hh] hours [mm] minutes and [ss] seconds")
  else{
    durationString = duration.minutes() + "m "  + 
                     duration.seconds() + "s";
  
    // if the duration lasted more than 1 hour, pre-pend the string with "[hh] hours "
    if(duration.hours() > 0){
      durationString = duration.hours() + "h " + durationString;
    }
  }

  return durationString;
}


// format the isoTime to look like this -> 1:32 PM on Saturday, November 16, 2019
function getFormattedDateTimeStringFromISO(isoTime){
  return moment(isoTime).format("h:mm A [on] dddd, MMMM Do, YYYY");
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



function findROUTELinestringCoordsIndexFromLatLon(geoJsonLGroup, latLon){

  const lineString = getFeatureFromGeoJsonLayerGroup(geoJsonLGroup , "ROUTE", "LineString");
  const coordsArray = lineString.geometry.coordinates;
  return findIndexForLatlon(coordsArray, latLon);
  
  /*
  * _findItemForLatLng -- Finds an item with the smallest delta in distance to the given latlng coords
  */
 function findIndexForLatlon(coords, latlng) {
   let index = null,
   // result = null,        
   d = Infinity;
   coords.forEach(function(coord, i) {
     const coordLatLon = {
       "lat": coord[1],
       "lng": coord[0],
      };
      const dist = latlng.distanceTo(coordLatLon);
      if (dist < d) {
        d = dist;
        // result = coord;
        index = i;
      }
    });
    return index;
  }
  
}

