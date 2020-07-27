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

      // layer.bindPopup(createPopupHTMLVideo(properties), bindPopupProperties);

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

  // if we want to set the elevation to appear only when we click
  // certain parts of the feature group, we can add the below code
  // to any of the above "cases"
  // layer.on('click dblclick', function(e) {
  //   let 
  //   showElevationForRideID(e, e.target.feature.properties.rideID);
  //   // console.log(e);
  // });


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
  let videoEmbedHTML = (videoEmbedID !== '' ? videoEmbedParams.firstHalf + videoEmbedID + videoEmbedParams.secondHalf : 'no video URL<br>');

  let rideName = getTextFromValue(ridesData[currentRideID].metadata.rideName);

  let stravaURL = getTextFromValue(ridesData[currentRideID].metadata.stravaURL);
  let stravaHTML = (stravaURL !== '' ? '<h3><a href="' + stravaURL + '" target="_blank">Click here for Strava Recording and Map</a></h3>' : 'no strava URL<br>');

  let googleMapURL = getTextFromValue(ridesData[currentRideID].metadata.googleMapURL);
  let googleMapHTML = (googleMapURL !== '' ? '<h3><a href="' + googleMapURL + '" target="_blank">Click here for detailed Google Map</a></h3>' : 'no googlemap URL');

  let detailsPointFeature = ridesData[currentRideID].features.find( (element, i) =>{
    
    if(element.geometry.type === "Point" && element.properties.name === "DETAILS"){
      return true;
    }
    return false;
  });

  let detailsPointDescription = (detailsPointFeature ? detailsPointFeature.properties.description : 'no description found');
 
  return  '<h2>ROUTE: ' + rideName + '</h2>' +
          detailsPointDescription + '<br><br>' +
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
  
  return  "<h3><b>" + markerTypeText + "</b>: " + rideName + "</h3>" + properties.description;
          // "<b>Location Details:</b><br>" + properties.description;

}


// **************************************************************************************
//         FUNCTIONS TO CREATE THE LEGEND WHEN IT'S ADDED TO THE MAP
// **************************************************************************************

// THIS IS THE LEGEND ONADD FUNCTION WE WILL USE. BELOW IS AN EXAMPLE OF A DIFFERENT TYPE
function legendOnAdd(map) {
  
  // create a div for the legend
  let div = L.DomUtil.create('div', 'info legend');

  labels = ['<strong>Markers</strong>'],

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
  div.innerHTML += '<hr>';

  // And this time just using the += because laziness
  div.innerHTML += '<strong>Route Types</strong>' + '<br>';
  div.innerHTML += '<span class="legend-route-completed-icon"></span>' +          '<span>' + routeLineProperties.completed.legendText + '</span>' + '<br>';
  div.innerHTML += '<span class="legend-route-suggested-icon"></span>' +          '<span>' + routeLineProperties.suggested.legendText + '</span>';// + '<br>';
  // div.innerHTML += '<span class="legend-route-variant-normal-icon"></span>' +     '<span>' + routeLineProperties.variantNormal.legendText + '</span>' + '<br>';
  // div.innerHTML += '<span class="legend-route-variant-difficult-icon"></span>' +  '<span>' + routeLineProperties.variantDifficult.legendText + '</span>';
  
  return div;
}



// FUNCTION THAT MANAGES THE ADDING AND REMOVING OF THE ELEVATION CONTROL LAYER AND RABBIT DISPLAY LAYER
function showElevationForRideID(clickedRideID){

  if(elevationRideID !== clickedRideID && clickedRideID !== undefined){
    
    elevationRideID = clickedRideID;
    // clear the display on the elevationControl
    elevationControl.clear();

    // if a rabbit layer already exists, we need to remove it, otherwise it will stay on the map forever
    if(elevationRabbitLayer !== undefined){
      elevationRabbitLayer.clearLayers();
      // elevationRabbitLayer.remove();
    }

    // get the feature who's name is ROUTE and who's type is "LineString"
    // so we can use its coordinates for the newGeoJSON we'll use to create the RabbitLayer
    let routeLineString = ridesData[elevationRideID].features.find( (feature) => 
                                                                    feature.properties.name === "ROUTE"
                                                                    && feature.geometry.type === "LineString"
                                                                );

    let newGeoJSON = {
      "name":"RabbitLayerOverlay",
      "type":"FeatureCollection",
      "features":[
          {
              "name": "RABBIT_ROUTE",
              "type":"Feature",
              "geometry": {
                  "type":"LineString",
                  "coordinates": routeLineString.geometry.coordinates
              },
              "properties":null
          }
      ]
    };        

    // assign the rabbitLayer to a new geoJSON
    elevationRabbitLayer = L.geoJson(newGeoJSON,{
      // pane: 'elevationPane', // panes don't seem to work
      onEachFeature: elevationControl.addData.bind(elevationControl),
      // filter: function(feature, layer) {  // the filter function doesn't seem to work either
      //     // return feature.geometry.type !== "LineString";
      // },
      style: { fillOpacity: 0.0, weight: routeLineProperties.rabbitLayer.lineWeight, opacity: 1, color: routeLineProperties.rabbitLayer.lineColor}
    });

    // map.createPane('elevationPane');
    // map.getPane('elevationPane').style.zIndex = 401;

    // if the elevationControl Layer's container is null, 
    // then that means it has previously been removed from the map
    // so we need to add it back before we add the rabbit layer
    if(elevationControl.getContainer() === null){
        elevationControl.addTo(map);
    }

    elevationRabbitLayer.addTo(map);
      
  }
  else{
      console.log('clicked on ride with same "elevationRideID" as before: ', elevationRideID); 
  }

}



function clearElevationDisplay(operation){

  if(elevationControl.getContainer() !== null){
      elevationRabbitLayer.remove();
      elevationRabbitLayer = undefined;
      elevationRideID = "";
      elevationControl.clear();

      if(operation === "remove"){
        elevationControl.remove();
      }
  }
  else{
    // console.log("rideIDs are equal? ", removedRideID === elevationRideID);
    console.log("elevationControl container exists? ", elevationControl.getContainer() !== null);
  }

}




// *****************************************************************
//     RE-CENTER/ZOOM THE MAP WITH THE DETAILS POINT AS THE CENTER
// *****************************************************************

function reCenterMap(rideIDtoCenterOn){
  // find the DETAILS pin in the Features array for the GeoJSON
  let detailsPoint = ridesData[rideIDtoCenterOn].features.find( (feature) => feature.properties.name === "DETAILS");
  let centerLatLon = detailsPoint.geometry.coordinates.slice(0, 2).reverse();
  map.flyTo(centerLatLon, typicalZoom + 2, {animate: true, duration: 0.5});
}




















