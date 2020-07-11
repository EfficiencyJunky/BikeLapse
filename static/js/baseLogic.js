/* ##################################################################################
   ****  EXECUTE API CALL, SETUP DEPENDENT VARIABLES AND CREATE INITIAL MAP STATE
##################################################################################### */

// we create an asyncronous counter that only calls the "createMap" function
// once the counter has been incremented enough times to equal the "numAPICalls" integer
// currently we are only doing this once so it's sort of not really useful
// but if we wanted to execute another API call we could update it
let numAPICalls = 1;
var myAsyncCounter = new asyncCounter(numAPICalls, createMap);

 

/* ##################################################################################
   ****  CREATE INITIAL MAP STATE
##################################################################################### */
function createMap(){


  // *************************************************************
  //     FIRST DEFINE THE "TILE LAYERS" TO USE AS  
  //     THE ACTUAL MAPS WE WILL DRAW FEATURES ON TOP OF 
  // *************************************************************
  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/streets-v11",
      // id: "mapbox.streets",
      accessToken: API_KEY
  });

  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/dark-v9",      
      // id: "mapbox.dark",
      accessToken: API_KEY
  });

  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/satellite-v9",
      // id: "mapbox.streets-satellite",
      accessToken: API_KEY
  });  
  
  // // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  // let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  //     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //     maxZoom: maximumZoom,
  //     minZoom: minimumZoom,
  //     id: "mapbox/outdoors-v11",
  //     // id: "mapbox.outdoors",
  //     accessToken: API_KEY
  // });

  // *************************************************************
  // Define a baseMaps object to hold our base layers
  // *************************************************************
  let baseMaps = {
      "Street Map": streetmap,
      // "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
  };

  
  // *************************************************************
  // Define the overlayMaps object to hold our overlay layers
  // *************************************************************
  let overlayMaps = {};


  // *************************************************************
  //     SECOND DEFINE THE "DATA LAYERS" TO USE AS THE VISUAL 
  //     INFORMATION/DATA WE WILL DRAW ON TOP OF THE TILE LAYER 
  //     ADD THEM AS KEY/VALUE PAIRS IN THE OVERLAYMAPS OBJECT
  // *************************************************************

  bikeRideIDsList.map( (rideID,i) => {
    // console.log("key:" + rideID);
    // console.log("index:" + i);

    let rideMetadata = bikeRidesMetadata[rideID];

    if (typeof(rideMetadata.geoJSON) !== 'undefined'){
      // console.log("DATA EXISTS: " + rideMetadata.route_name);

      overlayMaps[rideMetadata.route_name] = L.geoJson(rideMetadata.geoJSON, { 
                                                                                pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                                                style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: rideMetadata.line_color},
                                                                                pointToLayer: pointToLayerFunction,
                                                                                onEachFeature: onEachFeatureFunction
                                                                              });
    }
    else{
      console.log("DATA UNDEFINED: " + rideMetadata.route_name);
    }

  });


  // *************************************************************
  //     ADD THE BASIC LAYERS TO THE ACTUAL MAP
  // *************************************************************
  // *************************************************************
  // set up our panes and zIndex ordering so they layer correctly 
  // when added and removed using the layer control UI
  // the zIndex number will make sure they stack on eachother 
  // in the order we want them to
  // *************************************************************    
  myMap.createPane('bikeRidesPane');
  myMap.getPane('bikeRidesPane').style.zIndex = 400;

  // *************************************************************
  // ADD THE INITIALLY CHOSEN MAP LAYERS TO THE MAP
  // add the initial layers we want to display on the map
  // our basemap (the canvas we'll draw on) will come from the basemaps object 
  // and our overlay (bike routes) will come from the overlayMaps objects
  // *************************************************************
  baseMaps[selectedBaseMap].addTo(myMap);
  overlayMaps[bikeRidesMetadata[bikeRideIDsList[initialVisibleRideIndex]].route_name].addTo(myMap);

  // *************************************************************
  //     ADD ADDITIONAL UI ELEMENTS TO THE MAP
  // *************************************************************
  createUIElements(baseMaps, overlayMaps);
}



/* ##################################################################################
   ****  BUILD LAYER CONTROL UI ELEMENTS AND LEGEND - ADD THEM TO MAP
##################################################################################### */

function createUIElements(baseMaps, overlayMaps){
  
  // *************************************************************
  //  ADD GENERIC LAYER CONTROL  - Bottom Left
  //      Pass in our baseMaps and overlayMaps
  //      Add the layer control to the map on bottom left
  // *************************************************************
  let mapLayerControl = L.control.layers(baseMaps, overlayMaps, {
      collapsed: false,
      position: 'bottomleft'
  }).addTo(myMap);

  // console.log("layer control", mapLayerControl.getContainer());

  // *************************************************************
  //  ADD CONTROL ELEMENT TO ACT AS A LEGEND - Bottom right
  //      set the "onAdd" function to create some HTML to display
  // *************************************************************
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
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
              bikeRouteColorCodes[key].short_description + (grades[i + 1] ? '<br>' : '');

      }
      
      if(showSignificantColor === true){
        div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
      }

      return div;
  };
  
  legend.addTo(myMap);


  //createEventHandlers();
}






/* ############################################################################################################################
// **************** ASYNCRONOUS COUNTER FUNCTIONS TO CONTROL WHEN WE CALL THE "createMap()" FUNCTION ******************
// **************** BECAUSE WE ONLY WANT TO CALL THIS FUNCTION AFTER ALL THE API CALLS HAVE COMPLETED *****************
############################################################################################################################### */
function asyncCounter(numCalls, callback){
  this.callback = callback;
  this.numCalls = numCalls;
  this.calls = 0;
};


asyncCounter.prototype.increment = function(){

  this.calls += 1;

  if(this.calls === this.numCalls){
      this.callback();
  }
};


// THIS IS THE MAIN FUNCTION OF THE JS FILE
for(i=0; i < numAPICalls; i++){
  myAsyncCounter.increment();
}