/* ################################################################################################
   ****  THIS IS THE SHARED CODE FOR INITIALIZING OUR MAP
################################################################################################### */


// Prior to setting up the basemaps and UI for our map, we want to
// check and see if the API_KEY even exists (did they include a file with one?)
// and if it exists, we need to verify it works and so we have permission to access the mapbox tilesets
// if we can access them, then we set "mapboxTilesAvailable" to true
// if we can't access them for some reason then we set it to false and print out the response status code
function initializeBaseMaps(){

    // check to make sure the MAPBOX_API_KEY actually exists (typeofand assign it to the API_KEY global variable. 
    // If the MAPBOX_API_KEY doesn't exist, set it to an empty string
    // this will allow the rest of the program to function and gracefully handle
    // the fact that the API_KEY never existed
    let API_KEY = (typeof(MAPBOX_API_KEY) === 'undefined') ? '' : MAPBOX_API_KEY;

    let mapboxTestURL = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/1/1/1?access_token=' + API_KEY;
    
    fetch(mapboxTestURL)
        .then(response => { 

            let mapboxTilesAvailable = false;

            if (response.status === 200) {
                mapboxTilesAvailable = true;
            }
            else{
                console.log('testing mapbox tileset "GET" request\nResponse status code:', response.status, response.statusText);
                console.log("check to make sure your mapbox API_KEY is setup correctly and has the correct permissions");
                mapboxTilesAvailable = false;
            }
            
            createBaseMaps(mapboxTilesAvailable);
        });

}



function createBaseMaps(mapboxTilesAvailable = false){
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

    // IF THE MAPBOX.COM TILES ARE AVAILABLE (FROM OUR CHECK ABOVE), THEN CREATE THE TILE LAYERS
    // These are developed by Mapbox.com
    // In order to use these tiles, you have to create an account on Mapbox.com and generate an API_KEY
    // The API_KEY will allow you to access the tiles for free up to a certain amount of usage per month
    // it should be sufficient for any small website with minimal usage
    if(mapboxTilesAvailable){
        // darkmap -- this map feels like "night time". Later on in the code there is logic to use the darkmap as the initially loaded tile layer if your local time is betwee 8pm and 6am
        var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
            maxZoom: maximumZoom,
            minZoom: minimumZoom,
            id: "mapbox/dark-v9",      
            // id: "mapbox.dark",
            accessToken: MAPBOX_API_KEY
        });

        // streetmap -- the type of default map we are used to seeing on services like google maps
        var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
            maxZoom: maximumZoom,
            minZoom: minimumZoom,
            id: "mapbox/streets-v11",
            // id: "mapbox.streets",
            accessToken: MAPBOX_API_KEY
        });


        // satellite -- self explanitory
        var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
            maxZoom: maximumZoom,
            minZoom: minimumZoom,
            id: "mapbox/satellite-v9",
            // id: "mapbox.streets-satellite",
            accessToken: MAPBOX_API_KEY
        });  
    }


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
    let baseMapsLayerControl = L.control.layers(baseMaps, undefined, {
        collapsed: mapUISettings.baseLayerCtl.collapsed,
        position: mapUISettings.baseLayerCtl.position
    }).addTo(map);

    // we first set the initialBasemap to "Terrain" as this is the default behavior we want
    let initialBasemap = terrainmap;

    // if mapboxTilesAvailable is true (this is set in the initializeBaseMaps() function), 
    // then we want to add the mapbox base layers to the layer control
    // and we want to set the initialBasemap to Darkmap (if it is night time)
    // otherwise, we will set it to Street Map if it's daytime
    if(mapboxTilesAvailable){
        baseMapsLayerControl.addBaseLayer(darkmap, "Dark Map **");
        baseMapsLayerControl.addBaseLayer(streetmap, "Street Map **");
        baseMapsLayerControl.addBaseLayer(satellite, "Satellite **");

        let isNight = getIsNight();
        initialBasemap = isNight ? darkmap : streetmap;
    }

    // add the initialBasemap (tile layer chosen based on criteria above)
    initialBasemap.addTo(map);

}


function initializeMapOverlaysAndUI(hideElevationDisplayDiv = false){
    // *************************************************************
    //  ADD LEGEND -- LEAFLET CONTROL OBJECT
    //      set the location to mapUISettings.legend.position
    //      set the "onAdd" function to create some HTML to display
    // *************************************************************
    let legend = L.control({position: mapUISettings.legend.position});

    // set the onAdd function to be our custom legendOnAdd function defined below
    legend.onAdd = legendOnAdd;
    
    // add it to the map
    legend.addTo(map);


    // *************************************************************
    //  ADD ELEVATION DISPLAY -- ELEVATION CONTROL LAYER
    //      then either remove it - if we are loading the index page
    //      or move it to a separate div - if we are loading the create-ride page
    // *************************************************************
    // initialize the elevationControl by adding to the map
    elevationControl.addTo(map);
    
    // ##### ABRACADABRA #######
    // if we havent't yet defined the div that we want to put our elevationControl inside of
    // then we should create a control layer, add it to the map, grab the div that contains it
    // and store a reference to that container div in our "elevationDisplayDiv" variable
    if(elevationDisplayDiv === undefined){

        // create a new Control Layer that we add the elevationControl to and overlay on the map
        let elevationControlContainerLayer = L.control({position: mapUISettings.elevation.position});

        // when we add the layer to the map we will create a div inside it and add a header title
        elevationControlContainerLayer.onAdd = function(mymap){
            let div = L.DomUtil.create('elevation-display-div', 'elevation-container');
            div.innerHTML = "<div><h5>Elevation</h5></div>";

            return div;
        };

        // add the layer to the map
        elevationControlContainerLayer.addTo(map)

        // grab a reference to the div where the layer has been placed on the map
        // and store it in our globally accessible "elevationDisplayDiv" variable so we can hide/unhide later
        elevationDisplayDiv = elevationControlContainerLayer.getContainer();
    }


    // grab the div that contains the elevationControl layer and move it to our elevationDisplayDiv
    elevationDisplayDiv.appendChild(elevationControl.getContainer());

    // elevationDisplayDiv.innerHTML += '<div style="clear: both;">&nbsp;</div>';
    

    if(hideElevationDisplayDiv){
        elevationDisplayDiv.hidden = true;
    }


    // *************************************************************
    //  CREATE VIDEO DISPLAY DIV
    //      if we've declared a "videoDisplayDiv" variable
    //      then we should create the videoDisplayContainerLayer
    //      and save a reference to the div that contains it
    // *************************************************************
    // similar thing to what we're doing for the elevationControl layer above except this time we're creating a layer to contain the video player iFrame
    if(videoDisplayDiv === undefined){

        let videoIframeContainerLayer = L.control({position: mapUISettings.videoViewer.position});

        videoIframeContainerLayer.onAdd = function(mymap){
        
          // get 'player-parent' div
          let div = L.DomUtil.get('player-parent');
          div.hidden = false;
        
          return div;
        };
        
        // add the layer to the map
        videoIframeContainerLayer.addTo(map);

        videoDisplayDiv = videoIframeContainerLayer.getContainer();
    }

}





/* ################################################################################################
   ****  LEGEND "ON ADD" FUNCTION 
   ****     THIS IS OUR CUSTOM FUNCTION TO GENERATE A LEGEND WITHIN A CONTROL LAYER
   ****     IT IS CALLED WHEN WE ADD THE LEGEND CONTROL LAYER TO THE MAP
################################################################################################### */
function legendOnAdd(map) {
  
    // create a div for the legend
    let div = L.DomUtil.create('div', 'info legend');

    labels = ['<strong>Markers</strong>'];

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




  