// ###########################################################################################################
// THIS FILE CONTAINS THE SHARED CUSTOM FUNCTIONS THAT CREATE THE LEAFLET FEATURS FOR THE GEOJSON LAYERS AND
// AND VARIOUS OTHER LEAFLET SPECIFIC FUNCTIONALITY
// ###########################################################################################################


// ************************************************************************************************************************************
// FIRST WE START WITH THE FUNCTIONS PASSED IN AS OPTIONS TO THE GEOJSON LAYER UPON CREATION
//     Information on the usage of these functions can be found here: https://leafletjs.com/reference-1.6.0.html#geojson
//        FUNCTION CALL ORDER for GEOJSON LAYER ADD
//           1) The Filter Function is called to remove any features that we don't want cluttering the Layer
//           2) optionally -- The pointToLayerFunction is called if the feature is a Point
//           3) The onEachFeature is called to bind any popups or any additional things that might need to be done
// ************************************************************************************************************************************

// ####### FILTER FUNCTION #################################################
// This function allows us to decide whether to include a feature or not. 
// if the function returns true, the feature will be included
// if the function returns false, the feature will not be included
// the default function is to return true;
function filterFunction (geoJsonFeature) {

  // we will filter out features by their geometry type
  switch (geoJsonFeature.geometry.type) {
    // include all LineString features
    case 'LineString':
      return true;
      break;
    // include all Point features who's names appear as keys
    // in the global mapIcons settings object
    case 'Point':

      if(mapIconsKeys.includes(geoJsonFeature.properties.name)){
        return true;
      }
      
      break;
  }

  return false;
}


// ####### POINT TO LAYER FUNCTION #################################################
// This function allows us to define how points are added to the layer
// the default behavior is to simply create a marker for each point
// by using the following code: "return L.marker(latlng);"
function pointToLayerFunction(geoJsonPoint, latlng) {

  let markerType = geoJsonPoint.properties.name;
  
  switch (markerType) {
    // case 'DETAILS': 
    //   return L.marker(latlng);
    //   break;
    case 'START':
    case 'FINISH':
    case 'PHOTO_OP':
    case 'POI':

      let myIcon = createMarkerIcon(markerType);

      return L.marker(latlng, {icon: myIcon});
      break;
    default:
       // this is the default functionality for the pointToLayerFunction described in the Leaflet.js documentation. 
       // removing it will effectively remove all points that are not in the switch statement above
      return L.marker(latlng);
  }

}


// ####### ON EACH FEATURE FUNCTION #################################################
// A Function that will be called once for each created Feature, after it has been created and styled. 
// Useful for attaching events and popups to features. 
// The default is to do nothing with the newly created layers:
// function (feature, layer) {}
function onEachFeatureFunction(feature, layer) {

  // console.log("On Each Feature Function Call");
  // console.log("Feature Type: ", feature.geometry.type);
  // console.log("Feature Name: ", feature.properties.name);
  // // console.log("rideMetadata: ", rideMetadata);
  // console.log("currentRideID: ", currentRideID);
  // console.log("**********************************");

  let properties = feature.properties;

  switch (feature.geometry.type) {
    case 'LineString': 

      // layer.bindPopup(createPopupHTMLDetailsPoint(properties), bindPopupProperties);

      break;
    case 'Point':

      if(properties.name === "DETAILS"){
        layer.bindPopup(createPopupHTMLDetailsPoint(properties), bindPopupProperties);
      }
      else{
        layer.bindPopup(createPopupHTMLBasicPoints(properties), bindPopupProperties);
      }
      
      break;
  }

  // if we want to set the elevation to appear only when we click
  // certain parts of the feature group, we can add the below code
  // to any of the above "cases"
  // layer.on('click dblclick', function(e) {
  //   let 
  //   showElevationForRideID(e, e.target.feature.properties.rideID);
  //   // console.log(e);
  // });
}



// ####### STYLE FUNCTION #################################################
// A Function that will be called once for each created Feature, after it has been created and styled. 
// Useful for attaching events and popups to features. 
// The default is to do nothing with the newly created layers:
// function (feature, layer) {}
function styleFunction (geoJsonFeature) {

  // console.log("**********************************");
  // console.log("currentRideID: ", currentRideID);
  // console.log("Filter Function Call");
  // console.log("Feature Type: ", geoJsonFeature.geometry.type);
  // console.log("Feature Name: ", geoJsonFeature.properties.name);
  // console.log("    ###    ");
  
  switch (geoJsonFeature.geometry.type) {
    case 'LineString':
      let lineStringName = geoJsonFeature.properties.name;
      // console.log("LineString name", lineStringName);
      // console.log("Includes #? ", lineStringName.includes("#"));

      // pull out the metadata object for the ride to use later
      metadata = ridesData[currentRideID].metadata;

      // create the lineColor variable to use for the color of the Feature's line
      // let lineColor = metadata.lineColor;
      let lineColor = routeLineProperties["default"].lineColor;

      // if the metadata object has a "rideType" (not undefined),
      // and the "rideType" itself is not undefined,
      // use the value stored there as the key
      // into the global line options object to get the corresponding lineColor
      if(typeof(metadata.rideType) !== undefined && metadata.rideType !== undefined){
        // console.log("metadata rideType: ", metadata.rideType);
        lineColor = routeLineProperties[metadata.rideType].lineColor;
      }

      // if the name includes a "$" then it's supposed to the easy route option and should be colored accordingly
      // if the name includes a "#" then it's supposed to the hard route option and should be colored accordingly
      if(lineStringName.includes("$")){
        lineColor = metadata.lineColorEasy;
      }
      else if(lineStringName.includes("#")){
        lineColor = metadata.lineColorHard;
      }

      return { fillOpacity: 0.0, weight: 4, opacity: 1, color: lineColor};
      break;
    case 'Point':
      return {}; // default behavior to do nothing for Point features
      break;
  }
  
  // default behavior
  return {};
}




// #############################################################################
// *********  HELPERS FOR ABOVE GEOJSON CREATION FUNCTIONS ****************
// #############################################################################
// creates the correct Marker object
// depending on if we are supposed to use the "divIcon" or regular "icon"
// which is designated in the markerProperties (coming from the mapIcons global variable)
function createMarkerIcon(markerType){

  let markerProperties = mapIcons[markerType];
  
  switch (markerProperties.iconType) {
    case 'divIcon':
      return L.divIcon({
                        className: markerProperties.iconURLorClass,
                        iconSize: markerProperties.iconSize,
                        iconAnchor: markerProperties.iconAnchor,
                        popupAnchor: markerProperties.popupAnchor,
                        // shadowUrl: 'my-icon-shadow.png',
                        // shadowSize: [68, 95],
                        // shadowAnchor: [22, 94]
                      });
      // break;
    default:
      return L.icon({
                      iconUrl: markerProperties.iconURLorClass,
                      iconSize: markerProperties.iconSize,
                      iconAnchor: markerProperties.iconAnchor,
                      popupAnchor: markerProperties.popupAnchor,
                      // shadowUrl: 'my-icon-shadow.png',
                      // shadowSize: [68, 95],
                      // shadowAnchor: [22, 94]
                    });
      
  }

}

// ####### CREATE THE HTML FOR DETAILS POINT POPUP BINDING #####################################
// creates the HTML code necessary for the "DETAILS" Popup
// IN THE FUTURE, WE MAY WANT TO GENERATE ALL THE 'detailsPointDesctiption' HTML
// FROM THE PROPERTIES WE STORE IN THE DETAILS PIN
function createPopupHTMLDetailsPoint(properties){

  let rideMetadata = ridesData[currentRideID].metadata;
  let rideFeatures = ridesData[currentRideID].features;

  // let videoEmbedID = validate(rideMetadata.videoEmbedID);
  // let videoEmbedHTML = (videoEmbedID !== '' ? videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf : 'no video URL<br>');

  let rideName = validate(rideMetadata.rideName);

  let stravaURL = validate(rideMetadata.stravaURL);
  let stravaHTML = (stravaURL !== '' ? '<h3><a href="' + stravaURL + '" target="_blank">Click here for Strava Recording and Map</a></h3>' : 'no strava URL<br>');

  let googleMapURL = validate(rideMetadata.googleMapURL);
  let googleMapHTML = (googleMapURL !== '' ? '<h3><a href="' + googleMapURL + '" target="_blank">Click here for detailed Google Map</a></h3>' : 'no googlemap URL');

  // find the point feature named "DETAILS"
  let detailsPointFeature = rideFeatures.find( (element, i) =>{
    
    if(element.geometry.type === "Point" && element.properties.name === "DETAILS"){
      return true;
    }
    return false;
  });

  let detailsPointDescription = (detailsPointFeature ? detailsPointFeature.properties.description : 'no description found');
 
  return  '<h2>RIDE: ' + rideName + '</h2>' +
          detailsPointDescription + '<br><br>' +
          // videoEmbedHTML +
          stravaHTML +
          googleMapHTML;
}

// formerly "getTextFromValue"
// tests whether the value exists (either undefined or empty string) 
// and then returns the actual text or an empty string if it's undefined or already an empty string
// this is not exactly necessary, but it's helpful if we for some reason
// the geoJSON we're working with doesn't have the correct metadata we need
function validate(value){
  
  if(typeof(value) !== 'undefined' && value !== ''){
    // console.log("value exists: ", value);

    return value;

  }

  // console.log("value does not exist: ", value);
  
  return '';

}


// ####### CREATE THE HTML FOR START/FINISH POINT POPUP BINDING #####################################
// creates the HTML code necessary for the "START" and "FINISH" Popups
// probably need to re-name this function
function createPopupHTMLBasicPoints(properties){
  let markerTypeText = mapIcons[properties.name].markerText;

  let rideName = ridesData[currentRideID].metadata.rideName;
  
  return  "<h3><b>" + markerTypeText + "</b>: " + rideName + "</h3>" + properties.description;
          // "<b>Location Details:</b><br>" + properties.description;

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
  if(elevationHighlightLayer !== undefined){
    elevationHighlightLayer.remove();
    // elevationHighlightLayer.clearLayers();
  }

  let elevationHighlightGeoJSON = {
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

  // assign a new geoJson layer with the 'elevationHighlightGeoJSON' data to the 'elevationHighlightLayer' object
  // this also adds the data to display in the elevationControl
  elevationHighlightLayer = L.geoJson(elevationHighlightGeoJSON,{
    onEachFeature: elevationControl.addData.bind(elevationControl),
    style: { fillOpacity: 0.0, weight: routeLineProperties.highlightLayer.lineWeight, opacity: 1, color: routeLineProperties.highlightLayer.lineColor}
  });

  // add the highlight layer to the map
  elevationHighlightLayer.addTo(map);


}


// Sometimes we need to clear the elevation display 
// everytime we click on a different ride than we had previously selected
// and everytime we remove the ride from the map that is currently showing its elevation
// in that case we want to remove the elevation control along with the layer
function clearElevationDisplay(){

  if(elevationControl.getContainer() !== null){
      // first remove the elevationHighlightLayer
      elevationHighlightLayer.remove();

      // set it to undefined so we know it needs to be re-initialized
      elevationHighlightLayer = undefined;

      // reset the highlightedRideID
      highlightedRideID = "";

      // clear the elevationControl display
      elevationControl.clear();

  }
  else{
    // console.log("rideIDs are equal? ", removedRideID === highlightedRideID);
    console.log("elevationControl container exists? ", elevationControl.getContainer() !== null);
  }

}


// #############################################################################
// *********  YOUTUBE VIDEO + RABBIT DISPLAY FUNCTIONS ************************
// #############################################################################
// This function manages the adding and removing of the
// youtube video and rabbit marker
// function loadYouTubeVideoForRideID(clickedRideID){

//   let youTubeVideoID = ridesData[clickedRideID].metadata.videoEmbedID;

//   // We only want to run this logic if we are clicking on a different
//   // ride than we had previously clicked on, or if we haven't clicked
//   // on a ride at all yet and the videoID is valid
//   if(youTubeVideoID !== ""){
//     loadYouTubeVideo(youTubeVideoID);
//     return true;
//   }

//   return false;
// }


// function prepareRabbitForRide(clickedRideID){

//   videoHasBikeLapseSync = ridesData[clickedRideID].metadata.hasBikeLapseSync;

//   if(videoHasBikeLapseSync){
//     let routeLineString = getROUTELineStringFromGeoJson(ridesData[clickedRideID]);
//     rabbitCoordsArray = routeLineString.geometry.coordinates;
//     syncRabbitMarkerToVideo("frameIndex", 0);    
//   }
//   else{
//     rabbitCoordsArray = undefined;
//     rabbitMarker.remove();
//   }

// }



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
    // console.log("adding rabbit");
    rabbitMarker.addTo(map);
  } 

}

// simple method to print out the rabbit Marker object for debugging
function getRabbitCoords(){    
  return rabbitMarker._latlng;
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











