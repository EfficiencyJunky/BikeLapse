/* ################################################################################################
   ****  THIS IS THE SHARED CODE FOR INITIALIZING OUR MAP
################################################################################################### */

// Prior to setting up the basemaps and UI for our map, we want to
// check and see if we have permission to access the mapbox tilesets
// if we can access them, then we set "mapboxTilesAvailable" to true
// if we can't access them for some reason then we set it to false and print out the response status code
function initializeMap(){

    let mapboxTestURL = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/1/1/1?access_token=' + API_KEY;
    
    fetch(mapboxTestURL)
        .then(response => { 

            let mapboxTilesAvailable = false;

            if (response.status === 200) {
                mapboxTilesAvailable = true;
            }
            else{
                console.log("map load response status code:", response.status);
                console.log("check to make sure your mapbox API_KEY is setup and has the correct permissions");
                mapboxTilesAvailable = false;
            }
            
            createBaseMapsAndUI(mapboxTilesAvailable);
        });

}



function createBaseMapsAndUI(mapboxTilesAvailable){
    // *************************************************************
    // FIRST DEFINE THE BASEMAPS (AKA "TILE LAYERS") TO USE AS  
    //     THE ACTUAL MAPS WE WILL DRAW FEATURES ON TOP OF 
    // *************************************************************

    // CREATE THE STAMEN.COM TILE LAYERS
    // These are developed by https://www.stamen.com and hosted for free use by fastly.net
    // terrainmap
    let terrainmap = L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
        maxZoom: maximumZoom,
        minZoom: minimumZoom
    });


    // tonerlitemap
    let tonerlitemap = L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="http://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
        maxZoom: maximumZoom,
        minZoom: minimumZoom
    });

    // CREATE THE MAPBOX.COM TILE LAYERS
    // These are developed by Mapbox.com
    // In order to use these tiles, you have to create an account on Mapbox.com and generate an API_KEY
    // The API_KEY will allow you to access the tiles for free up to a certain amount of usage per month
    // it should be sufficient for any small website with minimal usage
    // darkmap -- this map feels like "night time". Later on in the code there is logic to use the darkmap as the initially loaded tile layer if your local time is betwee 8pm and 6am
        let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox/dark-v9",      
        // id: "mapbox.dark",
        accessToken: API_KEY
    });

    // streetmap -- the type of default map we are used to seeing on services like google maps
    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox/streets-v11",
        // id: "mapbox.streets",
        accessToken: API_KEY
    });


    // satellite -- self explanitory
    let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\" target=\"_blank\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox/satellite-v9",
        // id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });  



    // *************************************************************************
    // ADD OUR BASELAYERS (TILESETS) TO THE LAYER CONTROL
    // AND ADD ONE OF THEM TO THE MAP AS THE INITIAL BASEMAP
    // *************************************************************************
    
    // Define a baseMaps object to hold our initial set of base layers from Stamen.com
    var baseMaps = {
        "Terrain": terrainmap,
        "Light Map": tonerlitemap
    };    
    
    // create a Layer Control element specifically for our baselayer
    // we will add additional base layers (tilesets) and overlay layers (json data) as we load the data
    let baseLayerControl = L.control.layers(baseMaps, undefined, {
        collapsed: false,
        position: mapUISettings.baseLayerCtl.position
    }).addTo(map);

    // we first set the initialBasemap to "Terrain" as this is the default behavior we want
    let initialBasemap = terrainmap;

    // if mapboxTilesAvailable is true (this is set in the initializeMap() function), 
    // then we want to add the mapbox base layers to the layer control
    // and we want to set the initialBasemap to Darkmap (if it is night time)
    // otherwise, we will set it to Street Map if it's daytime
    if(mapboxTilesAvailable){
        baseLayerControl.addBaseLayer(darkmap, "Dark Map **");
        baseLayerControl.addBaseLayer(streetmap, "Street Map **");
        baseLayerControl.addBaseLayer(satellite, "Satellite **");

        let isNight = getIsNight();
        initialBasemap = isNight ? darkmap : streetmap;
    }

    // add the initialBasemap (tile layer chosen based on criteria above)
    initialBasemap.addTo(map);
    

    // *************************************************************
    //  ADD LAYER CONTROL TO ACT AS A LEGEND - 
    //      set the location to mapUISettings.legend.position
    //      set the "onAdd" function to create some HTML to display
    // *************************************************************
    let legend = L.control({position: mapUISettings.legend.position});

    // set the onAdd function to be our custom legendOnAdd function defined below
    legend.onAdd = legendOnAdd;
    
    // add it to the map
    legend.addTo(map);


    // *************************************************************
    //  ADD OUR ELEVATION CONTROL LAYER TO MAP TO INITIALIZE IT
    //      then either remove it - if we are loading the index page
    //      or move it to a separate div - if we are loading the create-ride page
    // *************************************************************
    // initialize the elevationControl by adding to the map
    elevationControl.addTo(map);

    // SET THE DEFAULT STATE OF THE ELEVATION CONTROL LAYER
    // if we haven't created a separate div for displaying the elevation control
    // then we will display the elevation control layer within the actual map (default behavior)
    // so we want to remove the elevation control layer until the user selects a ride at which point we will display it
    // if(elevationDisplayDiv){
    if(typeof(elevationDisplayDiv) === 'undefined'){
        console.log("elevation display div undefined");
        // console.log(elevationDisplayDiv);
        elevationControl.remove();
    }
    // else if we have a div setup to display the elevation control layer
    // we want to move the elevation control layer into that div
    else{
        // grab the elevationControl container and move it to the elevationDisplayDiv
        elevationDisplayDiv.appendChild(elevationControl.getContainer());
    }
    
}



/* ################################################################################################
   ****  ON ADD FUNCTION FOR OUR LEGEND
   ****     THIS IS OUR CUSTOM FUNCTION TO GENERATE A LEGEND WITHIN A CONTROL LAYER
################################################################################################### */
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
