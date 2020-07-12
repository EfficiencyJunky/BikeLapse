// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************


// ************************************************************************************************************************************
//     THESE ARE THE FUNCTIONS AVAILABLE FOR THE OPTIONS OBJECT WHEN CREATING A GEOJSON LAYER
//     Information on the usage of these functions can be found here: https://leafletjs.com/reference-1.6.0.html#geojson
//        FUNCTION CALL ORDER for GEOJSON LAYER ADD
//           1) The Filter Function is called to remove any features that we don't want cluttering the Layer
//           2) optionally -- The pointToLayerFunction is called if the feature is a Point
//           3) The onEachFeature is called to bind any popups or any additional things that might need to be done
// ************************************************************************************************************************************




// A Function that will be used to decide whether to include a feature or not. The default is to include all features:
// This function allows us to filter out features
// if the function returns true, the feature will be included
// if the function returns false, the feature will not be included
// the default function is to return true;
function filterFunction (geoJsonFeature) {

  // console.log("**********************************");
  // console.log("currentRideID: ", currentRideID);
  // console.log("Filter Function Call");
  // console.log("Feature Type: ", geoJsonFeature.geometry.type);
  // console.log("Feature Name: ", geoJsonFeature.properties.name);
  // console.log("    ###    ");

  switch (geoJsonFeature.geometry.type) {
    case 'LineString':
      return true;
      break;
    case 'Point':

      if(mapIconsKeys.includes(geoJsonFeature.properties.name)){
        return true;
      }
      
      break;
  }

  return false;
}




// This function allows us to define how points are added to the layer
// the default behavior is to simply create a marker for each point
// by using the following code: "return L.marker(latlng);"
function pointToLayerFunction(geoJsonPoint, latlng) {

  // console.log("Point To Layer Function Call");
  // console.log("Feature Type: ", geoJsonPoint.geometry.type);
  // console.log("Feature Name: ", geoJsonPoint.properties.name);
  // console.log("    ###    ");

  let markerType = geoJsonPoint.properties.name;

  switch (markerType) {
    // case 'DETAILS': 
    //   return L.marker(latlng);
    //   break;
    case 'START':
    case 'FINISH':
    case 'PHOTO_OP':
    // case 'POI':
      let iconVals = mapIcons[markerType];

      let myIcon = L.icon({
        iconUrl: iconVals.iconUrl,
        iconSize: iconVals.iconSize,
        iconAnchor: iconVals.iconAnchor,
        popupAnchor: iconVals.popupAnchor,
        // shadowUrl: 'my-icon-shadow.png',
        // shadowSize: [68, 95],
        // shadowAnchor: [22, 94]
      });
    
      return L.marker(latlng, {icon: myIcon});
      break;
    default:
       // this is the default functionality for the pointToLayerFunction described in the Leaflet.js documentation. 
       // removing it will effectively remove all points that are not in the switch statement above
      return L.marker(latlng);
  }

}





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

      layer.bindPopup(markerContentVideo(properties), bindPopupProperties);

      break;
    case 'Point':

      if(properties.name === "DETAILS"){
        layer.bindPopup(markerContentVideo(properties), bindPopupProperties);
      }
      else{
        layer.bindPopup(markerContentBasic(properties), bindPopupProperties);
      }
      
      break;
  }
}



// **************************************************************************************
// **************** HELPERS FOR ABOVE FUNCTIONS ******************
// **************************************************************************************
function markerContentVideo(properties){
  let videoEmbedID = bikeRidesMetadata[currentRideID].videoEmbedID;
  let routeName = bikeRidesMetadata[currentRideID].routName;
  let googleMapURL = bikeRidesMetadata[currentRideID].googleMapURL;
 
  return  "<h2>ROUTE: " + routeName + "</h2>" +
          "<h3><a href=" + googleMapURL + ">Click here for detailed Google Map</a>" + "</h3>" +
          videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf;
}


function markerContentBasic(properties){
  let markerTypeText = mapIcons[properties.name].markerText;

  let routeName = bikeRidesMetadata[currentRideID].routName;
  
  return  "<h3><b>" + markerTypeText + "</b>: " + properties.description + "</h3>" +
          "<b>ROUTE:</b> " + routeName;

}


// **************************************************************************************
//         FUNCTIONS TO GET COLORS FOR CIRCLES USED IN LEGEND 
// **************************************************************************************

function getColorNormal(d) {
  return d >= 5.0  ? '#FF0000' :
         d >= 4.0  ? '#FFCC00' :
         d >= 3.0   ? '#ccff00' :
         d >= 2.0   ? '#66ff00' :
         d >= 1.0   ? '#00FF00' :
                    '#00FF00';
}

function getColorSignificant(d) {
  return '#000000';
}