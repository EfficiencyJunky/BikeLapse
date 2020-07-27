/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */
// *************************************************************
//     FIRST DEFINE THE MAP OBJECT, CONTROL LAYERS AND SETTINGS
// *************************************************************
// Create our map using the div with id="map"
let map = L.map("map", {
  // center: [37.77, -122.42], // san francisco
  center: [30, 0], // san francisco
  zoom: 2
});

// THE GEOJSON LAYER WITH OUR RIDE DATA THAT WE WILL ADD/REMOVE FROM THE MAP
let geoJsonLayer = undefined;

// override global map zoom parameters
maximumZoom = 18;
minimumZoom = 2;

// since we're only dealing with one single ride in this version of the map
// we can set the rideID to be anything we want
currentRideID = "single_ride_ID";


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
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/streets-v11",
      // id: "mapbox.streets",
      accessToken: API_KEY
  });

  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/dark-v9",      
      // id: "mapbox.dark",
      accessToken: API_KEY
  });

  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
      maxZoom: maximumZoom,
      minZoom: minimumZoom,
      id: "mapbox/satellite-v9",
      // id: "mapbox.streets-satellite",
      accessToken: API_KEY
  });  
  
  // THIS WAY OF DOING IT I FOUND FROM LOOKING AT THE CODE ON MonkeyBrains website
  let tonerlitemap = L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
    maxZoom: maximumZoom,
    minZoom: minimumZoom
  });

  // THIS WAY OF DOING IT I FOUND FROM LOOKING AT THE CODE ON MonkeyBrains website
  let terrainmap = L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
    maxZoom: maximumZoom,
    minZoom: minimumZoom
  });

  // THIS WAY OF DOING IT REQUIRES A LIBRARY THAT DOESN'T HAVE THE "s" in "https" SO DOESN'T WORK AS A SECURE SITE
  // replace "toner" here with "terrain" or "watercolor"
  // let tonerlitemap = new L.StamenTileLayer("toner-lite");
  // let terrainmap =  new L.StamenTileLayer("terrain");


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
  // ADD THE INITIALLY CHOSEN MAP LAYERS TO THE MAP
  // add the initial layers we want to display on the map
  // our basemap (the canvas we'll draw on) will come from the basemaps object 
  // *************************************************************
  baseMaps[selectedBaseMap].addTo(map);
  

  /* ##################################################################################
    ****  BUILD LAYER CONTROL UI ELEMENTS AND LEGEND - ADD THEM TO MAP
  ##################################################################################### */  
  // *************************************************************
  //  ADD GENERIC LAYER CONTROL  - mapUISettings.layerCtl.position
  //      Pass in our baseMaps
  //      Add the layer control to the map on mapUISettings.layerCtl.position
  // *************************************************************
  L.control.layers(baseMaps, undefined, {
      collapsed: false,
      position: mapUISettings.layerCtl.position
  }).addTo(map);

  // *************************************************************
  //  ADD CONTROL ELEMENT TO ACT AS A LEGEND - mapUISettings.legend.position
  //      set the "onAdd" function to create some HTML to display
  // *************************************************************
  let legend = L.control({position: mapUISettings.legend.position});

  legend.onAdd = legendOnAdd;
  
  legend.addTo(map);


  // add the elevationControl to the map to initialize it
  elevationControl.addTo(map);

  // then immediately remove it so it doesn't show up on the map until we create a ride
  elevationControl.remove();  


}




function addRideToMap(operation = undefined){
  
  // if we're updating the map, then first clear the layers on it
  if(operation === "update"){
    clearElevationDisplay();
    geoJsonLayer.remove();
  }
  // otherwise assume we're adding a ride to the map for the first time
  // in this case, create the "bikeRidesPane" and set it's Z index
  else{
    map.createPane('bikeRidesPane');
    map.getPane('bikeRidesPane').style.zIndex = 399;
  }
 
  
  // *************************************************************
  // Define the overlayMaps object to hold our overlay layers
  // *************************************************************
  
  // *************************************************************
  //     SECOND DEFINE THE "DATA LAYER" TO USE AS THE VISUAL 
  //     INFORMATION/DATA WE WILL DRAW ON TOP OF THE TILE LAYER 
  // *************************************************************
  
  if (ridesData[currentRideID] !== undefined){

    geoJsonLayer = L.geoJson(ridesData[currentRideID], { 
                                                          pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                          filter: filterFunction,
                                                          pointToLayer: pointToLayerFunction,
                                                          onEachFeature: onEachFeatureFunction,
                                                          style: styleFunction
                                                          // style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: ridesData[currentRideID].metadata.lineColor}
                                                        });
  }
  else{
    console.log("RIDE DATA UNDEFINED");
    return;
  }


  // *************************************************************
  //     ADD THE BASIC LAYERS TO THE ACTUAL MAP
  // *************************************************************
  // *************************************************************
  // set up our panes and zIndex ordering so they layer correctly 
  // when added and removed using the layer control UI
  // the zIndex number will make sure they stack on eachother 
  // in the order we want them to
  // *************************************************************    
  geoJsonLayer.addTo(map);
  // overlayMaps[ridesData[currentRideID].metadata.rideName].addTo(map); // this is the way we do it in the index.html file

  showElevationForRideID(currentRideID);

  // re-center the map on the location of the ride
  reCenterMap(currentRideID);

}



createMap();