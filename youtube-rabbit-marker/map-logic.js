/* ###################################################################
   ****  THE MAIN MAP OBJECTS NEED TO BE GLOBALY ACCESSIBLE
   ****  AND SOME GLOBAL MAP AND MAP UI SETTINGS
###################################################################### */
// Create our map using the div with id="map"
let map = L.map("map", {
    center: [37.39, -122.32], // san francisco
    zoom: 11
});

// map zoom parameters
let minimumZoom = 10;
let maximumZoom = 18;
let defaultRideViewZoom = 11;

// settings for map UI elements
let mapUISettings = {
    "baseLayerCtl":     { "position": "topright",        "collapsed": true   },
    "overlayLayerCtl":  { "position": "topleft",         "collapsed": false  },
    "legend":           { "position": "bottomright"                          },
    "elevation":        { "position": "bottomleft"                           },
    "zoomCtl":          { "position": "topright"                             },
};
  

let rabbitMarker;
let rabbitIconWidth = 200;
let rabbitIconHeight = 167;
let rabbitIconScale = 0.2;

let coordsArray =   (rideJSON.features.find ( (feature) => 
                                                feature.properties.name === "ROUTE"
                                                && feature.geometry.type === "LineString"
                                            )
                    ).geometry.coordinates ;
let coordsArrayLength = coordsArray.length;
let coordsArrayHalfway = Math.round(coordsArray.length / 3);
let rabbitInitialLatLon = coordsArray[0].slice(0, 2).reverse();


map.flyTo(rabbitInitialLatLon, defaultRideViewZoom, {animate: true, duration: 1});


function createBaseMap(){
    // *************************************************************
    // FIRST DEFINE THE BASEMAPS (AKA "TILE LAYERS") TO USE AS  
    //     THE ACTUAL MAPS WE WILL DRAW FEATURES ON TOP OF 
    // *************************************************************

    // CREATE THE STAMEN.COM TILE LAYERS
    // These are developed by https://www.stamen.com and hosted for free use by fastly.net
    // terrainmap
    let terrainmap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a target="_blank" href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="https://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="https://www.openstreetmap.org/copyright">ODbL</a></a>.',  
        maxZoom: maximumZoom,
        minZoom: minimumZoom
    });


    // tonerlitemap
    let tonerlitemap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a target="_blank" href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="https://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="https://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="https://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
        maxZoom: maximumZoom,
        minZoom: minimumZoom
    });

    // *************************************************************************
    // ADD BASEMAP LAYER CONTROL -- 
    //      THE LAYER CONTROL THAT HOLDS OUR BASELAYERS (TILESETS)
    // *************************************************************************
    // Define a baseMaps object to hold our initial set of base layers from Stamen.com
    let baseMaps = {
        "Terrain": terrainmap,
        "Light Map": tonerlitemap
    };    
    
    // create a Layer Control element specifically for our baselayer
    // we will add additional base layers (tilesets) and overlay layers (json data) as we load the data
    let baseLayerControl = L.control.layers(baseMaps, undefined, {
        collapsed: mapUISettings.baseLayerCtl.collapsed,
        position: mapUISettings.baseLayerCtl.position
    }).addTo(map);

    terrainmap.addTo(map);


}






createBaseMap();
loadMapData();
showRabbitMarker(rabbitInitialLatLon, 'latlon');




/* ###############################################################################
   ****  LOAD THE JSON FILES FOR EACH RIDE                  ****
   ****  LISTED IN THE "all_ride_file_names.js" FILE        ****
################################################################################## */

// "bikeRideJSONFileNames" is a variable found in the "all_ride_file_names.js" file
function loadMapData(){
      
    // ****************************************************************************
    // CREATE A GEOJSON LAYER FOR THE 'rideJSON'
    //    ATTACH EVENT LISTENER FOR WHEN WE CLICK ON THE LAYER IN THE MAP
    //    ATTACH EVENT LISTENER FOR WHEN WE REMOVE THE LAYER FROM THE MAP (UNCHECK IT)
    // ****************************************************************************
    let geoJsonLayer = L.geoJson(rideJSON, { 
                                                // pane: 'bikeRidesPane', // the "pane" option is inherited from the "Layer" object
                                                filter: function(feature){
                                                    return feature.properties.name === "ROUTE";
                                                },
                                                // pointToLayer: pointToLayerFunction,
                                                // onEachFeature: onEachFeatureFunction,
                                                // style: styleFunction
                                                style: { fillOpacity: 0.0, weight: 4, opacity: 1, color: "blue"}
                                            });
  

    geoJsonLayer.addTo(map);

}



function showRabbitMarker(value, valType){

    let latlon;

    // get the latlon from the coordsArray based on the
    // value type that is passed in
    switch(valType){
        case "latlon":
            latlon = value;
            break;
        // notice we don't use a break for "percentComplete" 
        // because we also want the logic from "frameNum" to be executed
        case "percentComplete":
            value = Math.round(value * coordsArrayLength);
        case "frameNum":
            let frameNumber = (value < coordsArrayLength) ? value : coordsArrayLength - 1;
            latlon = coordsArray[frameNumber].slice(0, 2).reverse();
            break;
    }

    // if the rabbitMarker hasn't been instantiated yet, create it
    // otherwise, simply update its latlon
    if (!rabbitMarker) {

        let iconW = Math.round(rabbitIconWidth*rabbitIconScale);
        let iconH = Math.round(rabbitIconHeight*rabbitIconScale);

        let iconSize = [iconW, iconH];
        let iconAnchor = [Math.round(iconW/2), iconH];

        var rabbitIcon = L.icon({
            iconUrl: '../img/rabbit-marker.png',
            shadowUrl: '../img/rabbit-marker-shadow.png',
        
            iconSize:     iconSize, // size of the icon
            shadowSize:   iconSize, // size of the shadow
            iconAnchor:   iconAnchor, // point of the icon which will correspond to marker's location
            shadowAnchor: [3, iconH],  // the same for the shadow
            popupAnchor:  [-3, -iconSize] // point from which the popup should open relative to the iconAnchor
        });

        rabbitMarker = new L.Marker(latlon, {icon:rabbitIcon}).addTo(map);

    } else {
        rabbitMarker.setLatLng(latlon);
    }
}



// simple method to print out the rabbit Marker object for debugging
function getRabbitCoords(){    
    return console.log(rabbitMarker);
}
