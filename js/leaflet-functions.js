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


// // *************************************************************************************** 
// // EXTEND THE ELEVATION CONTROL CLASS ALSO
// //    We want to be able to get access to the "_data" member of the Elevation Control
// //    because it does a lot of calculations for us
// // *************************************************************************************** 
L.Control.Elevation.include({
  setUnits: function (units) {    
    this.options.imperial = (units === "imperial");
  }
});

// L.Control.Elevation.include({
//   getData: function () {
//     let data = this._data = this._data || {}; // Initialize the data, if missing.
//     return data;
//   }
// });



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
                                            // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: geoJson.metadata.lineColor}
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
  // in our case, the only features we style are LineString features
  function styleFunction (geoJsonFeature) {

    // declare the variable we will store our style object in
    let style;

    switch (geoJsonFeature.geometry.type) {
      case 'LineString':
        
        // create the lineColor variable to use for the color of the Feature's line
        let routeType = "default";

        // grab the lineString's Name
        const lineStringName = geoJsonFeature.properties.name;
        
        // if the "hasBikeLapseSync" member in the rideMetadata object is not undefined,
        // and the value itself is true,
        // then get set routeType to "bikelapse" else set to "regular"
        if(typeof(rideMetadata.hasBikeLapseSync) !== "undefined" && rideMetadata.hasBikeLapseSync){
          routeType = "bikelapse";
        }
        // if the name includes a "$" then it's supposed to the easy route option and should be styled accordingly        
        else if(lineStringName.includes("$")){
          routeType = "easy";    
        }
        // if the name includes a "#" then it's supposed to the hard route option and should be styled accordingly
        else if(lineStringName.includes("#")){
          routeType = "hard";
        }
        else{
          routeType = "regular";
        }

        // create the final style options object
        style = { 
                  "fillOpacity": routeLineProperties[routeType].lineFillOpacity, 
                  "weight": routeLineProperties[routeType].lineWeight, 
                  "opacity": routeLineProperties[routeType].lineOpacity, 
                  "color": routeLineProperties[routeType].lineColor
                };


        break;
      // default behavior
      default:
        style = {};
        break;
    }
    
    
    return style;
  }




  // ####### POINT TO LAYER FUNCTION #################################################
  // This function allows us to define how points are added to the layer
  // the default behavior is to simply create a marker for each point
  // by using the following code: "return L.marker(latlng);"
  function pointToLayerFunction(geoJsonPoint, latlng) {

    // grab reference to the point name
    const pointName = geoJsonPoint.properties.name;

    // if the pointName is not "DETAILS" then use it for the markerType
    // otherwise, check to see if "hasBikeLapseSync" is true in the metadata for the ride
    // and set the markerType accordingly
    const markerType =  (pointName !== "DETAILS") ? pointName :
                      (rideMetadata.hasBikeLapseSync) ? "DETAILS-BIKELAPSE" :
                      "DETAILS-REGULAR";

    // the markerType will be used to find the corresponding Icon in the mapIcons global settings object
    const icon = createMarkerIcon(markerType);
    
    // return a marker created with the icon
    return L.marker(latlng, {icon: icon});

  }






  // ####### ON EACH FEATURE FUNCTION #################################################
  // A Function that will be called once for each created Feature, after it has been created and styled. 
  // Useful for attaching events and popups to features. 
  // The default is to do nothing with the newly created layers:
  // function (feature, layer) {}
  function onEachFeatureFunction(feature, layer) {

    switch (feature.geometry.type) {
      case 'LineString': 

        // layer.bindPopup(createPopupHTMLDetailsPoint(properties), bindPopupProperties);

        break;
      case 'Point':

        if(feature.properties.name === "DETAILS"){
          // layer.bindPopup(createPopupHTMLDetailsPoint(properties), bindPopupProperties);
        }
        else{
          layer.bindPopup(createStartFinishPopupHTML(feature), bindPopupProperties);
        }
        
        break;
    }

  }


    /*
     * Handles mouseover events of the data layers on the map.
     */
    // _handleLayerMouseOver: function(evt) {
    //   if (!this._data || this._data.length === 0) {
    //       return;
    //   }
    //   var latlng = evt.latlng;
    //   var item = this._findItemForLatLng(latlng);
    //   if (item) {
    //       var x = item.xDiagCoord;
    //       this._showDiagramIndicator(item, x);
    //   }
    // }




  /*
    * _findItemForLatLng -- Finds an item with the smallest delta in distance to the given latlng coords
    */
  // function findItemForLatlon(latlng) {
  //   var result = null,
  //       index = null,
  //       d = Infinity;
  //   this._data.forEach(function(item, i) {
  //       var dist = latlng.distanceTo(item.latlng);
  //       if (dist < d) {
  //           d = dist;
  //           result = item;
  //           index = i;
  //       }
  //   });
  //   return [result, index];
  // }













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

  // // ####### CREATE THE HTML FOR DETAILS POINT POPUP BINDING #####################################
  // // creates the HTML code necessary for the "DETAILS" Popup
  // // IN THE FUTURE, WE MAY WANT TO GENERATE ALL THE 'detailsPointDesctiption' HTML
  // // FROM THE PROPERTIES WE STORE IN THE DETAILS PIN
  // function createPopupHTMLDetailsPoint(properties){

  //   let rideName = validate(rideMetadata.rideName);

  //   let stravaURL = validate(rideMetadata.stravaURL);
  //   let stravaHTML = (stravaURL !== "" ? 
  //                     `<h3>
  //                       <a href="${stravaURL}" target="_blank">
  //                         Click here for Strava Recording and Map
  //                       </a>
  //                     </h3>` : 'no strava URL<br>');

  //   let googleMapURL = validate(rideMetadata.googleMapURL);
  //   let googleMapHTML = (googleMapURL !== "" ? 
  //                       `<h3>
  //                         <a href="${googleMapURL}" target="_blank">
  //                           Click here for detailed Google Map
  //                         </a>
  //                       </h3>` : 'no googlemap URL');

  //   // get the description from the details point properties and create one if it's not defined   
  //   let rideStats = validate(rideMetadata.rideStats);
  //   let rideStatsHTML = (rideStats !== "" ? 
  //                         getRideStatsHTML(rideStats) : "no ride stats found");


  //   // get the description from the details point properties and create one if it's not defined   
  //   let detailsPointDescription = validate(properties.description);
  //   let detailsPointDescriptionHTML = (detailsPointDescription !== "" ? 
  //                                     detailsPointDescription + "<br>THIS IS THE OLD METHOD" : "no description found");

  //   let finalStatsHTML = (rideStatsHTML !== "no ride stats found") ? rideStatsHTML : detailsPointDescriptionHTML;


  //   return  `<h2>${rideName}</h2>
  //           ${finalStatsHTML}
  //           <br><br>
  //           ${stravaHTML}
  //           ${googleMapHTML}`;
  // }





  // // *********************************************************************************************************************
  // // THIS IS THE FUNCTION WHERE WE CREATE THE RIDESTATS HTML FOR THE RIDESTATS IN THE RIDE'S METADATA OBJECT
  // // the description is made up of calculations from the data in the route LineString
  // //      Time: Sunday, June 21, 2020 9:20 AM PDT<br>
  // //      Distance: 26.38 miles<br>
  // //      Duration: 3 hours, 11 minutes, and 11 seconds<br>
  // //      Average Speed: 10.8 mph<br>
  // //      Minimum Elevation: 24 feet<br>
  // //      Maximum Elevation: 599 feet<br>
  // //      Total climb: 1526 feet<br>
  // //      Total descent: 100 feet
  // // *********************************************************************************************************************
  // function getRideStatsHTML(rideStats){

  //   return `<b>Start Time:</b>            ${getFormattedDateTimeStringFromISO(rideStats.startTime)}<br>
  //           <b>Distance:</b>              ${rideStats.distance.mi} miles &nbsp (${rideStats.distance.km} km)<br>
  //           <b>Moving Time:</b>           ${getFormattedDurationStringFromISO(rideStats.duration.moving)}<br>
  //           <b>Avg Speed Moving:</b>      ${rideStats.avgSpeed.moving.mph} mph &nbsp (${rideStats.avgSpeed.moving.kph} kph)<br>
  //           <b>Total Time:</b>            ${getFormattedDurationStringFromISO(rideStats.duration.total)}<br>
  //           <b>Avg Speed Total:</b>       ${rideStats.avgSpeed.total.mph} mph &nbsp (${rideStats.avgSpeed.total.kph} kph)<br>
  //           <b>Minimum Elevation:</b>     ${rideStats.elevation.min.ft} feet &nbsp (${rideStats.elevation.min.m} meters)<br>
  //           <b>Maximum Elevation:</b>     ${rideStats.elevation.max.ft} feet &nbsp (${rideStats.elevation.max.m} meters)<br>
  //           <b>Total Climb:</b>           ${rideStats.elevation.gain.ft} feet &nbsp (${rideStats.elevation.gain.m} meters)<br>
  //           <b>Total Descent:</b>         ${rideStats.elevation.descent.ft} feet &nbsp (${rideStats.elevation.descent.m} meters)`;
  // }


  // // takes an ISO formatted duration and converts to a custom formatted string
  // function getFormattedDurationStringFromISO(isoDuration){

  //   let duration = moment.duration(isoDuration);

  //   // use the minutes and seconds to create a string that is formatted as "[minutes] minutes, and [seconds] seconds"
  //   // let durationString = duration.minutes() + "m "  + duration.seconds() + "s";
  //   let durationString = duration.minutes() + " minutes, and "  + duration.seconds() + " seconds";

  //   // if the duration lasted more than 1 hour, pre-pend the string with "[hours] hours, "
  //   if(duration.hours() > 0){
  //     // durationString = duration.hours() + "h " + durationString;
  //     durationString = duration.hours() + " hours, " + durationString;
  //   }

  //   return durationString;
  // }


  // ####### CREATE THE HTML FOR START/FINISH POINT POPUP BINDING #####################################
  // creates the HTML code necessary for the "START" and "FINISH" Popups
  // probably need to re-name this function
  function createStartFinishPopupHTML(feature){

    const properties = feature.properties;
    const pointCoords = feature.geometry.coordinates;
    const pointName = properties.name;    
    
    // get the meta from the point properties and create one if it's not defined   
    let pointMeta = validate(properties.meta);

    if(pointMeta !== "" ) {
      return getPointMetaHTML(pointName, pointMeta, pointCoords);
    }
    else{
      
      let rideName = rideMetadata.rideName;

      // get the description from the point properties and create one if it's not defined   
      let pointDescription = validate(properties.description);
      let pointDescriptionHTML = (pointDescription !== "" ? 
      pointDescription + "<br>OLD METHOD" : "no description found");
      
      return  `<h3><b>${pointName}</b>: ${rideName}</h3>
      ${pointDescriptionHTML}`;
    }
    
  }
  
  
  
  
  function getPointMetaHTML(markerTypeText, pointMeta, pointCoords){
    
    return  `<h3><b>${markerTypeText}</b>: ${pointMeta.locationName}</h3>
            <b>Time:</b> ${getFormattedDateTimeStringFromISO(pointMeta.time)}<br>
            <b>Elevation:</b> ${_toFeet(pointCoords[elevationIndex], 0)} feet &nbsp (${Math.round(pointCoords[elevationIndex])} meters)`;

    // return `<b>Location Name:</b> ${pointMeta.locationName}
    //         <br><br>
    //         <b>Time:</b> ${getFormattedDateTimeStringFromISO(pointMeta.time)}<br>
    //         <b>Elevation:</b> ${_toFeet(pointCoords[elevationIndex], 0)} feet &nbsp (${Math.round(pointCoords[elevationIndex])} meters)`

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

}