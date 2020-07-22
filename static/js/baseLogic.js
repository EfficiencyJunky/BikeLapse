/* ##################################################################################
   ****  EXECUTE API CALL, SETUP DEPENDENT VARIABLES AND CREATE INITIAL MAP STATE
##################################################################################### */

// we create an asyncronous counter that only calls the "createMap" function
// once the counter has been incremented enough times to equal the "numAPICalls" integer
// currently we are only doing this once so it's sort of not really useful
// but if we wanted to execute another API call we could update it
// let numAPICalls = 1;
// let numAPICalls = bikeRideIDsList.length;
let numAPICalls = bikeRideJSONFileNames.length;

var myAsyncCounter = new asyncCounter(numAPICalls, createMap);

/* ###################################################################
   ****  THE MAIN MAP OBJECT NEEDS TO BE GLOBALY ACCESSIBLE
###################################################################### */
// Create our map using the div with id="map"
let myMap = L.map("map", {
  center: [37.77, -122.42], // san francisco
  zoom: 10
});


/* ##################################################################################
   ****  CREATE INITIAL MAP STATE
##################################################################################### */
function createMap(){

  rideIDsList = Object.keys(ridesData);
  // singleRideID = bikeRideIDsList2[0];
  // console.log("Ride IDs From List: ", bikeRideIDsList2);
  // console.log("All Ride Data: ", ridesData2);
  // console.log("bikeRideIDsList: ", bikeRideIDsList);

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

  // THIS WAY OF DOING IT I FOUND FROM LOOKING AT THE CODE ON MonkeyBrains website
  let tonerlitemap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
    maxZoom: maximumZoom,
    minZoom: minimumZoom
  });

  // THIS WAY OF DOING IT I FOUND FROM LOOKING AT THE CODE ON MonkeyBrains website
  let terrainmap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
    maxZoom: maximumZoom,
    minZoom: minimumZoom
  });

  // THIS WAY OF DOING IT REQUIRES A LIBRARY THAT DOESN'T HAVE THE "s" in "https" SO DOESN'T WORK AS A SECURE SITE
  // replace "toner" here with "terrain" or "watercolor"
  // let tonerlitemap = new L.StamenTileLayer("toner-lite");
  // let terrainmap =  new L.StamenTileLayer("terrain");

  // stolen from MonkeyBrains website
  // let tonerlitemap_manual = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
  //   attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
  //   maxZoom: maximumZoom,
  //   minZoom: minimumZoom
    
  // });
  

  // *************************************************************
  // Define a baseMaps object to hold our base layers
  // *************************************************************
  let baseMaps = {
      "Street Map": streetmap,
      "Terrain": terrainmap,
      "Satellite": satellite,
      "Dark Map": darkmap,
      "Light Map": tonerlitemap
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

  rideIDsList.map( (rideID,i) => {

    currentRideID = rideID;

    let rideMetadata = ridesData[rideID].metadata;

    if (typeof(ridesData[rideID]) !== undefined){
      // console.log("DATA EXISTS: " + rideMetadata.rideName);

      overlayMaps[rideMetadata.rideName] = L.geoJson(ridesData[rideID], { 
                                                                          pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                                          filter: filterFunction,
                                                                          pointToLayer: pointToLayerFunction,
                                                                          onEachFeature: onEachFeatureFunction,
                                                                          style: styleFunction
                                                                          // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: rideMetadata.lineColor}
                                                                        });
    }
    else{
      console.log("DATA UNDEFINED: " + rideMetadata.rideName);
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

  initialRideIDsToDisplay.forEach((rideID,i) => {
    overlayMaps[ridesData[rideID].metadata.rideName].addTo(myMap);
  });


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

  legend.onAdd = legendOnAdd;
  
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




// LOAD THE JSON FILES FOR EACH RIDE AS SPECIFIED IN THE "bikeRideJSONFileNames" VARIABLE IN THE "globals.js" file
bikeRideJSONFileNames.forEach( (fileName, i) => {

  let filePath = "static/data/" + fileName;
  
  // Perform a GET request to the query URL
  d3.json(filePath, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function along with color seting function and pane name

    // create a new rideID based on the order in which the file was loaded. This way it's not in order of the file names.
    let rideID = "ride" + pad(i+1, 4);
    
    // rideData2[rideID] = data.metadata;
    ridesData[rideID] = data;
    
    // console.log(ridesData);

    // let rideID = data.metadata.rideID;
    // console.log(data.metadata.testdata, data);

    // ridesData[rideID].geoJSON = data;

    myAsyncCounter.increment();

    // Sending our earthquakes layer to the createMap function
    // createMap(earthquakes, tectonicPlates);
  });

});







// // THIS IS THE MAIN FUNCTION OF THE JS FILE
// for(i=0; i < bikeRideIDsList.length; i++){
//   console.log("increment");
//   myAsyncCounter.increment();
// }