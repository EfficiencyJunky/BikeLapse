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

      layer.bindPopup(createPopupHTMLVideo(properties), bindPopupProperties);

      break;
    case 'Point':

      if(properties.name === "DETAILS"){
        layer.bindPopup(createPopupHTMLVideo(properties), bindPopupProperties);
      }
      else{
        layer.bindPopup(createPopupHTMLBasic(properties), bindPopupProperties);
      }
      
      break;
  }
}




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
      
      let lineColor = ridesData[currentRideID].metadata.lineColor;

      // if the name includes a "$" then it's supposed to the easy route option and should be colored accordingly
      // if the name includes a "#" then it's supposed to the hard route option and should be colored accordingly
      if(lineStringName.includes("$")){
        lineColor = ridesData[currentRideID].metadata.lineColorEasy;
      }
      else if(lineStringName.includes("#")){
        lineColor = ridesData[currentRideID].metadata.lineColorHard;
      }

      //      { fillOpacity: 0.0, weight: 4, opacity: 1, color: rideMetadata.lineColor};
      return { fillOpacity: 0.0, weight: 4, opacity: 1, color: lineColor};
      break;
    case 'Point':
      return {}; // default behavior
      break;
  }
  
  // default behavior
  return {};
}





// **************************************************************************************
// **************** HELPERS FOR ABOVE FUNCTIONS ******************
// **************************************************************************************

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
      break;
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


// creates the HTML code necessary for the "DETAILS" Popup
// probably need to re-name this function
function createPopupHTMLVideo(properties){
  let videoEmbedID = getTextFromValue(ridesData[currentRideID].metadata.videoEmbedID);
  let videoEmbedHTML = (videoEmbedID !== "" ? videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf : "no video URL<br>");

  let rideName = getTextFromValue(ridesData[currentRideID].metadata.rideName);

  let stravaURL = getTextFromValue(ridesData[currentRideID].metadata.stravaURL);
  let stravaHTML = (stravaURL !== "" ? "<h3><a href=" + stravaURL + ">Click here for Strava Recording and Map</a></h3>" : "no strava URL<br>");

  let googleMapURL = getTextFromValue(ridesData[currentRideID].metadata.googleMapURL);
  let googleMapHTML = (googleMapURL !== "" ? "<h3><a href=" + googleMapURL + ">Click here for detailed Google Map</a></h3>" : "no googlemap URL");

  let detailsPointFeature = ridesData[currentRideID].features.find( (element, i) =>{
    
    if(element.geometry.type === "Point" && element.properties.name === "DETAILS"){
      return true;
    }
    return false;
  });

  let detailsPointDescription = (detailsPointFeature ? detailsPointFeature.properties.description : "no description found");
 
  return  "<h2>ROUTE: " + rideName + "</h2>" +
          detailsPointDescription + "<br><br>" +
          videoEmbedHTML +
          stravaHTML +
          googleMapHTML;
}

// tests whether the value exists (either undefined or empty string) 
// and then returns the actual text or an empty string if it's undefined or already an empty string
function getTextFromValue (value){
  
  if(typeof(value) !== undefined && value !== ''){
    // console.log("value exists: ", value);

    return value;

  }

  // console.log("value does not exist: ", value);
  return "";

}





// creates the HTML code necessary for the "START" and "FINISH" Popups
// probably need to re-name this function
function createPopupHTMLBasic(properties){
  let markerTypeText = mapIcons[properties.name].markerText;

  let rideName = ridesData[currentRideID].metadata.rideName;
  
  return  "<h3><b>" + markerTypeText + "</b>: " + properties.description + "</h3>" +
          "<b>ROUTE:</b> " + rideName;

}


// **************************************************************************************
//         FUNCTIONS TO CREATE THE LEGEND WHEN IT'S ADDED TO THE MAP
// **************************************************************************************

// THIS IS THE LEGEND ONADD FUNCTION WE WILL USE. BELOW IS AN EXAMPLE OF A DIFFERENT TYPE
function legendOnAdd(map) {
  
  // create a div for the legend
  let div = L.DomUtil.create('div', 'info legend');

  labels = ['<strong>LEGEND</strong>'],

  mapIconsKeys.map( (key, i) => {

    labels.push('<i class="' + mapIcons[key].iconURLorClass + '"></i>' + (key ? key : undefined));

    // this is how we'd do it if we didn't want to use the <i> (bullet) element
    // labels.push('<span class="' + mapIcons[key].iconURLorClass + ' legend-icon-positioning"></span>' + (key ? key : 'undefined'));

  });
  
  // takes the "labels" list and turns it into a single string with "<br>" appended between each item in the list
  // basically just a different way to accomplish the same thing as using the "div.innerHTML +=" in the 
  // above "mapIconsKeys.map" function. Potato Potahtoe
  div.innerHTML = labels.join('<br>');

  // create a horizontal line between the mapIcons section of the legend and the routes section
  div.innerHTML += '<hr>'

  // And this time just using the += because laziness
  div.innerHTML += '<strong>Route Types</strong>' + '<br>';
  div.innerHTML += '<span class="legend-route-icon"></span>' + '<span>Typical Route</span>' + '<br>';
  div.innerHTML += '<span class="legend-route-suggested-icon"></span>' + '<span>Variant - Suggested</span>' + '<br>';
  div.innerHTML += '<span class="legend-route-difficult-icon"></span>' + '<span>Variant - Difficult</span>';
  
  return div;
}


// OLD EXAMPLE FOR A LEGEND CREATION FUNCTION USING THE BELOW COLOR FUNCTIOINS
// This function uses the functions below to add a simple legend with color grades
// This is just a reference example and we don't actually use this in the program
function legendOnAddColorGrades(map) {
  
  // create a div for the legend
  let div = L.DomUtil.create('div', 'info legend');

  // add some HTML to that div to act as a title
  div.innerHTML += '<b>Color</b><br>';

  // create a list of grades that we will use for the values in the legend
  let grades = bikeRouteColorCodesKeys.map((key) => {
      return bikeRouteColorCodes[key].score;
  });
  //let grades = [1.0, 2.0, 3.0, 4.0, 5.0]

  // loop through our density intervals and generate a label with a colored square for each interval
  for (let i = 0; i < grades.length; i++) {
      let key = bikeRouteColorCodesKeys[i];

      div.innerHTML +=
          // '<i style="background:' + getColorNormal(grades[i]) + '"></i> ' +
          '<span class="legendDots" style="background:' + getColorNormal(grades[i]) + '"></span>' +
          // grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
          bikeRouteColorCodes[key].shortDescription + (grades[i + 1] ? '<br>' : '');

  }
  
  if(showSignificantColor === true){
    div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
  }

  return div;
}

// FUNCTIONS TO GET COLORS FOR CIRCLES USED IN LEGEND 
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
