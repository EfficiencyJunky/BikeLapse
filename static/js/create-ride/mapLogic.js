/* ###################################################################
   ****  GLOBAL VARIABLES -- GLOBAL VARIABLES -- GLOBAL VARIABLES ****
###################################################################### */
// *************************************************************
//     FIRST DEFINE THE MAP OBJECT
// *************************************************************
// Create our map using the div with id="map"
let map = L.map("map", {
  // center: [37.77, -122.42], // san francisco
  center: [30, 0], // san francisco
  zoom: 2
});

let mapLayerControl = undefined;


// // map zoom parameters
maximumZoom = 18;
minimumZoom = 2;
let typicalZoom = 10;


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
  //  ADD GENERIC LAYER CONTROL  - Bottom Left
  //      Pass in our baseMaps
  //      Add the layer control to the map on bottom left
  // *************************************************************
  mapLayerControl = L.control.layers(baseMaps, undefined, {
      collapsed: false,
      position: 'bottomleft'
  }).addTo(map);

  // *************************************************************
  //  ADD CONTROL ELEMENT TO ACT AS A LEGEND - Bottom right
  //      set the "onAdd" function to create some HTML to display
  // *************************************************************
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = legendOnAdd;
  
  legend.addTo(map);





}




function addRideToMap(){

  // since we're only dealing with one single ride in this version of the map
  // we can set the rideID to be anything we want
  // set the current rideID to the createRideInterfaceRideID variable
  // this way, no matter what the createRideInterfaceRideID variable is set to
  // the currentRideID will always be referencing that 
  currentRideID = createRideInterfaceRideID;
  
  // *************************************************************
  // Define the overlayMaps object to hold our overlay layers
  // *************************************************************
  let overlayMaps = {};

  // *************************************************************
  //     SECOND DEFINE THE "DATA LAYERS" TO USE AS THE VISUAL 
  //     INFORMATION/DATA WE WILL DRAW ON TOP OF THE TILE LAYER 
  //     ADD THEM AS KEY/VALUE PAIRS IN THE overlayMaps OBJECT
  //      IN THIS CASE WE ONLY ADD ONE LAYER
  // *************************************************************
  let rideMetadata = ridesData[currentRideID].metadata;

  if (typeof(ridesData[currentRideID]) !== undefined){
    // console.log("DATA EXISTS: " + rideMetadata.rideName);

    overlayMaps[rideMetadata.rideName] = L.geoJson(ridesData[currentRideID], { 
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


  // *************************************************************
  //     ADD THE BASIC LAYERS TO THE ACTUAL MAP
  // *************************************************************
  // *************************************************************
  // set up our panes and zIndex ordering so they layer correctly 
  // when added and removed using the layer control UI
  // the zIndex number will make sure they stack on eachother 
  // in the order we want them to
  // *************************************************************    
  map.createPane('bikeRidesPane');
  map.getPane('bikeRidesPane').style.zIndex = 399;

  overlayMaps[rideMetadata.rideName].addTo(map);
  // overlayMaps[ridesData[currentRideID].metadata.rideName].addTo(map); // this is the way we do it in the index.html file

  // *****************************************************************
  //     RE-CENTER/ZOOM THE MAP WITH THE DETAILS POINT AS THE CENTER
  // *****************************************************************
  // find the DETAILS pin in the Features array for the GeoJSON
  let detailsPoint = ridesData[currentRideID].features.find( (feature) => feature.properties.name === "DETAILS");

  // grab the lat/lon of the DETAILS point
  // since the coordinates array for a Point is in the format [lon, lat, elevation]
  // we have to get rid of the elevation with slice and then reverse the array
  // so we swap the positions of the lon, lat
  let centerLatLon = detailsPoint.geometry.coordinates.slice(0, 2).reverse();

  // now we can re-center the map
  // map.panTo(centerLatLon, {animate: true, duration: 1.0});
  map.flyTo(centerLatLon, typicalZoom, {animate: true, duration: 1.0});
  // map.setView(centerLatLon, typicalZoom, {animate: true, duration: 1.0});

}




createMap();