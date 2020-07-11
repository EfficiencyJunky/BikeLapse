// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************


// ************************************************************************************************************************************
//     THESE ARE THE FUNCTIONS AVAILABLE FOR THE OPTIONS OBJECT WHEN CREATING A GEOJSON LAYER
//     Information on the usage of these functions can be found here: https://leafletjs.com/reference-1.6.0.html#geojson
// ************************************************************************************************************************************

// This function allows us to define how points are added to the layer
// the default behavior is to simply create a marker for each point
// by simply using the following code: "return L.marker(latlng);"
function pointToLayerFunction(geoJsonPoint, latlng) {
  // console.log(geoJsonPoint);

  let markerType = geoJsonPoint.properties.type;

  switch (markerType) {
    case 'details': 
      return L.marker(latlng);
      break;
    case 'start':
    case 'finish':
    case 'photo_op':
    // case 'poi':
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
  }

  // return L.marker(latlng); // this is the default functionality
}


// A Function that will be called once for each created Feature, after it has been created and styled. 
// Useful for attaching events and popups to features. 
// The default is to do nothing with the newly created layers:
// function (feature, layer) {}
function onEachFeatureFunction(feature, layer) {
  // console.log(layer);

  let properties = feature.properties;

  switch (feature.geometry.type) {
    case 'LineString': 

      layer.bindPopup(markerContentVideo(properties),{maxWidth: 400});

      break;
    case 'Point':   
      if(properties.type === "details"){
        layer.bindPopup(markerContentVideo(properties),{maxWidth: 400});
      }
      else{
        layer.bindPopup(markerContentBasic(properties),{maxWidth: 400});
      }
      
      break;
  }
}


// This function allows us to filter out features
// if the function returns true, the feature will be included
// if the function returns false, the feature will not be included
// the default function is to return true;
function filterFunction (geoJsonFeature) {
  return true;
}


// **************************************************************************************
// **************** HELPERS FOR ABOVE FUNCTIONS ******************
// **************************************************************************************
function markerContentVideo(properties){
  let videoEmbedID = bikeRidesMetadata[properties.rideID].videoEmbedID;
  let routeName = bikeRidesMetadata[properties.rideID].route_name;
 
  return  "<h3>ROUTE: " + routeName + "</h3>" +
          videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf;
}


function markerContentBasic(properties){
  let markerTypeText = mapIcons[properties.type].markerText;

  let routeName = bikeRidesMetadata[properties.rideID].route_name;
  
  return  "<h3><b>" + markerTypeText + "</b>: " + properties.name + "</h3>" +
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