// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************
// **************** MAPPING HELPER FUNCTIONS ******************


// **************** FUNCTIONS TO GET COLORS FOR CIRCLES USED IN LEGEND ******************
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




// ********************************************************************************************
//     THESE ARE THE FUNCTIONS AVAILABLE FOR THE OPTIONS OBJECT WHEN CREATING A GEOJSON LAYER
//     Information on the usage of these functions can be found here: https://leafletjs.com/reference-1.6.0.html#geojson
// ********************************************************************************************

// This function allows us to define how points are added to the layer
// the default behavior is to simply create a marker for each point
// by simply using the following code: "return L.marker(latlng);"
function pointToLayerFunction(geoJsonPoint, latlng) {
  // console.log(geoJsonPoint);

  let iconVals = mapIcons[geoJsonPoint.properties.type];

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
  // return L.marker(latlng); // this is the default functionality
}


// A Function that will be called once for each created Feature, after it has been created and styled. 
// Useful for attaching events and popups to features. 
// The default is to do nothing with the newly created layers:
// function (feature, layer) {}
function onEachFeatureFunction(feature, layer) {
  // console.log(layer);

  switch (feature.geometry.type) {
    case 'LineString': 
      let videoEmbedID = bikeRidesInfo[feature.properties.rideID].videoEmbedID;
      let popupContent = "<h3>Route: " + feature.properties.name + "</h3>" +
                          videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf;

      layer.bindPopup(popupContent,{maxWidth: 400});

      break;
    case 'Point':   
      
      let preamble = mapIcons[feature.properties.type].markerText;
      let routeName = bikeRidesInfo[feature.properties.rideID].route_name;

      layer.bindPopup(
        "<h3><b>" + preamble + "</b>: " + feature.properties.name + "</h3>" +
        "<b>ROUTE:</b> " + routeName
      );
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



