// ###########################################################################################################
// THIS FILE CONTAINS THE SHARED CODE TO CREATE THE GEOJSON LAYER GROUP FOR A RIDE
//    CUSTOM FUNCTIONS THAT CREATE THE LEAFLET FEATURS FOR THE GEOJSON LAYERS
//    AND VARIOUS OTHER LEAFLET SPECIFIC FUNCTIONALITY
// ###########################################################################################################

// *************************************************************************************** 
// EXTEND THE BASE LEAFLET "Layer" CLASS USING ".include({myobjects})" 
//    In the documentation they use this nomenclature .include(MyMixin);"
//    Find out more here: https://leafletjs.com/reference-1.6.0.html#class
//    Since each JSON file has metadata attached to it (Ride Name, YouTube Video, etc.)
//    We will embed this metadata in each of our L.geoJson Layer Groups that
//    We create to represent each of our rides
// ***************************************************************************************     
L.Layer.include({
  getMetadata: function () {
    let options = this.options = this.options || {}; // Initialize the options, if missing.
    options.metadata = options.metadata || {}; // Initialize the metadata, if missing.
    return options.metadata;
  }
});



// *************************************************************************************** 
// MAIN FUNCTION FOR CREATING GEO JSON LAYER GROUP OUT OF BIKELAPSE JSON FILES 
// ***************************************************************************************     
function createGeoJsonLayerGroupForRide(geoJson, rideMetadata){  

  let geoJsonLGroup = L.geoJson(geoJson, { 
                                            pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                            filter: filterFunction,
                                            pointToLayer: pointToLayerFunction,
                                            onEachFeature: onEachFeatureFunction,
                                            style: styleFunction,
                                            metadata: rideMetadata
                                            // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: geoJsonData.metadata.lineColor}
                                          });


  return geoJsonLGroup;                       
  // ************************************************************************************************************************************
  // THESE ARE THE FUNCTIONS PASSED IN AS OPTIONS TO THE GEOJSON LAYER UPON CREATION
  //     Information on the usage of these functions can be found here: https://leafletjs.com/reference-1.6.0.html#geojson
  //        FUNCTION CALL ORDER for GEOJSON LAYER ADD
  //           1) The Filter Function is called to remove any features that we don't want cluttering the Layer
  //           2) pointToLayer OR style is called:
  //                 -- If the feature is of type Point the pointToLayerFunction is called
  //                 -- If the feature is of type LineString the styleFunction is called
  //           3) The onEachFeature is called to bind any popups or any additional things that might need to be done on each feature / layer

  // ************************************************************************************************************************************

  // ####### FILTER FUNCTION #################################################
  // This function allows us to decide whether to include a feature or not. 
  // if the function returns true, the feature will be included
  // if the function returns false, the feature will not be included
  // the default function is to return true;
  function filterFunction (geoJsonFeature) {

    // console.log("filter");

    // we will filter out features by their geometry type
    switch (geoJsonFeature.geometry.type) {
      // include all LineString features
      case 'LineString':
        return true;
        break;
      // include all Point features who's names appear as keys
      // in the global mapIcons settings object
      case 'Point':
        switch (geoJsonFeature.properties.name) {
          case 'START':
          case 'FINISH':
          case 'DETAILS': 
          // case 'PHOTO_OP':
          // case 'POI':
            return true;
        }
      default:
        return false;
    }
    
  }




  // ####### STYLE FUNCTION #################################################
  // Style's the features
  // in our case, the only feature we style is the ROUTE LineString
  function styleFunction (geoJsonFeature) {
    
    // console.log("style");
    // console.log(geoJsonFeature.geometry.type);

    switch (geoJsonFeature.geometry.type) {
      case 'LineString':
        let lineStringName = geoJsonFeature.properties.name;

        // create the lineColor variable to use for the color of the Feature's line
        let lineColor = routeLineProperties["default"].lineColor;

        // if the rideMetadata object has a "rideType" (not undefined),
        // and the "rideType" itself is not undefined,
        // use the value stored there as the key
        // into the global line options object to get the corresponding lineColor
        if(typeof(rideMetadata.rideType) !== undefined && rideMetadata.rideType !== undefined){
          lineColor = routeLineProperties[rideMetadata.rideType].lineColor;
        }

        // if the name includes a "$" then it's supposed to the easy route option and should be colored accordingly
        // if the name includes a "#" then it's supposed to the hard route option and should be colored accordingly
        if(lineStringName.includes("$")){
          lineColor = rideMetadata.lineColorEasy;
        }
        else if(lineStringName.includes("#")){
          lineColor = rideMetadata.lineColorHard;
        }

        return { fillOpacity: 0.0, weight: 4, opacity: 1, color: lineColor};
        break;
      // case 'OtherTypeHere?':
      //   console.log("style the point");
      //   return {}; // default behavior to do nothing for Point features
      //   break;
    }
    
    // default behavior
    return {};
  }




  // ####### POINT TO LAYER FUNCTION #################################################
  // This function allows us to define how points are added to the layer
  // the default behavior is to simply create a marker for each point
  // by using the following code: "return L.marker(latlng);"
  function pointToLayerFunction(geoJsonPoint, latlng) {

    // console.log("pointToLayer");

    let pointName = geoJsonPoint.properties.name;

    // if the pointName is not "DETAILS" then use it for the markerType
    // otherwise, check to see if "hasBikeLapseSync" is true in the metadata for the ride
    // and set the markerType accordingly
    let markerType =  (pointName !== "DETAILS") ? pointName :
                      (rideMetadata.hasBikeLapseSync) ? "DETAILS-BIKELAPSE" :
                      "DETAILS-REGULAR";

    // the markerType will be used to find the corresponding Icon in the mapIcons global settings object
    let icon = createMarkerIcon(markerType);
    
    return L.marker(latlng, {icon: icon});

  }






  // ####### ON EACH FEATURE FUNCTION #################################################
  // A Function that will be called once for each created Feature, after it has been created and styled. 
  // Useful for attaching events and popups to features. 
  // The default is to do nothing with the newly created layers:
  // function (feature, layer) {}
  function onEachFeatureFunction(feature, layer) {

    // console.log("onEachFeature");

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
    //   showElevationForRideLayerID(e, e.target.feature.properties.ridezID);
    //   // console.log(e);
    // });
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

    let rideName = validate(rideMetadata.rideName);

    let stravaURL = validate(rideMetadata.stravaURL);
    let stravaHTML = (stravaURL !== "" ? 
                      `<h3>
                        <a href="${stravaURL}" target="_blank">
                          Click here for Strava Recording and Map
                        </a>
                      </h3>` : 'no strava URL<br>');

    let googleMapURL = validate(rideMetadata.googleMapURL);
    let googleMapHTML = (googleMapURL !== "" ? 
                        `<h3>
                          <a href="${googleMapURL}" target="_blank">
                            Click here for detailed Google Map
                          </a>
                        </h3>` : 'no googlemap URL');


    // get the description from the details point properties and create one if it's not defined   
    let detailsPointDescription = validate(properties.description);
    let detailsPointDescriptionHTML = (detailsPointDescription !== "" ? 
                                      detailsPointDescription : 'no description found');
  
    return  `<h2>RIDE: ${rideName}</h2>
            ${detailsPointDescriptionHTML}
            <br><br>
            ${stravaHTML}
            ${googleMapHTML}`;
  }

  // formerly "getTextFromValue"
  // tests whether the value exists (either undefined or empty string) 
  // and then returns the actual text or an empty string if it's undefined or already an empty string
  // this is not exactly necessary, but it's helpful if we for some reason
  // the geoJSON we're working with doesn't have the correct metadata we need
  function validate(value){
    
    if(typeof(value) !== "undefined" && value !== ""){
      // console.log("value exists: ", value);

      return value;

    }

    // console.log("value does not exist: ", value);
    
    return "";

  }


  // ####### CREATE THE HTML FOR START/FINISH POINT POPUP BINDING #####################################
  // creates the HTML code necessary for the "START" and "FINISH" Popups
  // probably need to re-name this function
  function createPopupHTMLBasicPoints(properties){
    let markerTypeText = mapIcons[properties.name].displayText;

    // let rideName = ridesData[currentRidezID].metadata.rideName;
    let rideName = rideMetadata.rideName;
    
    return  `<h3><b>${markerTypeText}</b>: ${rideName}</h3>
                    ${properties.description}`;
            // "<b>Location Details:</b><br>" + properties.description;

  }

}