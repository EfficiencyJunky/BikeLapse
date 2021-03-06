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


// *****************************************************************
//     LOAD THE BASEMAPS INTO A LAYER CONTROL OVERLAY
// *****************************************************************
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
        maxZoom: terrainMaximumZoom,
        minZoom: minimumZoom
    });


    // tonerlitemap
    let tonerlitemap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a target="_blank" href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a target="_blank" href="https://openstreetmap.org">OpenStreetMap</a> under <a target="_blank" href="https://www.openstreetmap.org/copyright">ODbL</a>, and <a target="_blank" href="https://whosonfirst.mapzen.com#License">Who\'s On First</a>.',  
        maxZoom: tonerMaximumZoom,
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



// *****************************************************************
//   INITIALIZE ALL OF OUR OTHER OVERLAYS AND EXTERNAL UI ELEMENTS
// *****************************************************************
function initializeMapOverlaysAndUI(hideElevationDisplayDiv = true, hideVideoDisplayDiv = true, hideRideInfoDisplayDiv = true){
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
    
    // if we have defined our buttons in the legendOnAdd function, attach our "onchange" handler
    if(document.getElementById("units-radio-buttons")){
        document.getElementById("units-radio-buttons").onchange = dl_handleUnitsRadioButtonChanges;
    }
    
    // *************************************************************
    //  ADD RIDE INFO -- RIDE INFO CONTROL LAYER
    //      then either remove it - if we are loading the index page
    //      or move it to a separate div - if we are loading the create-ride page
    // *************************************************************
    if(rideInfoDisplayDiv === undefined){
        
        // create the layer
        let rideInfoDisplayLayer = L.control({
            position: mapUISettings.rideInfo.position
        });

        // define the layer's onAdd function
        rideInfoDisplayLayer.onAdd = function(mymap){
            // get the div in our HTML who's child elements contain the youtube iFrame and the video transport (playback) controls
            let div = L.DomUtil.get('ride-info-parent');

            // unhide this div as we will control visibility through the Container Layer's div
            // div.hidden = false;
        
          return div;
        };
        
        // add the layer to the map
        rideInfoDisplayLayer.addTo(map);

        // get a reference to the container/div that the Layer created in the onAdd function
        // store this div in our globally accessible "rideInfoDisplayDiv" variable so we can hide/unhide later
        rideInfoDisplayDiv = rideInfoDisplayLayer.getContainer();

        // uncomment this if we don't want clicks on this layer/div to propagate to the layers below
        // L.DomEvent.disableClickPropagation(rideInfoDisplayDiv);

    }
    
    // set the elevationDisplayDiv's hidden attribute to the variable we passed in (true by default meaning we want it to NOT be visible)
    rideInfoDisplayDiv.hidden = hideRideInfoDisplayDiv;




    // *************************************************************
    //  ADD ELEVATION DISPLAY -- ELEVATION CONTROL LAYER
    //      then either remove it - if we are loading the index page
    //      or move it to a separate div - if we are loading the create-ride page
    // *************************************************************
    // initialize the elevationControl by adding to the map
    elevationControl = L.control.elevation(elevationControlOptions);
    elevationControl.addTo(map);
    let elevationControlDiv = elevationControl.getContainer();
    
    // ##### OPTIONAL: CREATE A DIV TO DISPLAY THE ELEVATIOIN CONTROL IN #######
    // if we havent't yet defined the div to put our elevationControl inside of
    // then we will create a new control layer and add it to the map
    // get a reference to the div that leaflet creates to hold this new layer
    // and store a reference to that div in our "elevationDisplayDiv" variable
    // afterwards we will take the elevationControl and place it in this new layer/div
    if(elevationDisplayDiv === undefined){

        // create a new Control Layer that we will use to contain the elevationControl on the map
        let elevationDisplayLayer = L.control({
            position: mapUISettings.elevation.position
        });

        // define the layer's onAdd function
        elevationDisplayLayer.onAdd = function(mymap){
            // get the div in our HTML that we've plan on using as the container for the Elevation Control and title
            let div = L.DomUtil.get('elevation-display-div');

            return div;
        };

        // add the new layer to the map to create the div defined in the onAdd function
        elevationDisplayLayer.addTo(map)

        // get a reference to the container/div that the Layer created in the onAdd function
        // and store it in our globally accessible "elevationDisplayDiv" variable so we can hide/unhide later
        elevationDisplayDiv = elevationDisplayLayer.getContainer();

        // we want to give this layer's div an ID so that we can style it
        elevationControlDiv.setAttribute("id", "elevation-control-div");

        // we also want to give it classes that will allow us to collapse and expand it
        elevationControlDiv.classList.add("collapse", "show");
    }


    // grab the container/div that contains the elevationControl layer and move it to our elevationDisplayDiv
    elevationDisplayDiv.appendChild(elevationControlDiv);

    // set the elevationDisplayDiv's hidden attribute to the variable we passed in (true by default meaning we want it to NOT be visible)
    elevationDisplayDiv.hidden = hideElevationDisplayDiv;


    // *************************************************************
    //  CREATE VIDEO DISPLAY DIV
    //      if we've declared a "videoDisplayDiv" variable
    //      then we should create the videoDisplayContainerLayer
    //      and save a reference to the div that contains it
    // *************************************************************
    // similar thing to what we're doing for the elevationControl layer above except this time we're defaulting to creating a layer/div on the map to contain the video player iFrame
    if(videoDisplayDiv === undefined){
        
        // create the layer
        let videoDisplayLayer = L.control({
            position: mapUISettings.videoViewer.position
        });

        // define the layer's onAdd function
        videoDisplayLayer.onAdd = function(mymap){
            // get the div in our HTML who's child elements contain the youtube iFrame and the video transport (playback) controls
            let div = L.DomUtil.get('player-parent');

            // unhide this div as we will control visibility through the Container Layer's div
            // div.hidden = false;
        
          return div;
        };
        
        // add the layer to the map
        videoDisplayLayer.addTo(map);

        // get a reference to the container/div that the Layer created in the onAdd function
        // store this div in our globally accessible "videoDisplayDiv" variable so we can hide/unhide later
        videoDisplayDiv = videoDisplayLayer.getContainer();

        // we don't want clicks on this layer/div to propagate to the layers below
        // otherwise, our custom video playhead slider will malfunction
        L.DomEvent.disableClickPropagation(videoDisplayDiv);

    }
    
    // set the elevationDisplayDiv's hidden attribute to the variable we passed in (true by default meaning we want it to NOT be visible)
    videoDisplayDiv.hidden = hideVideoDisplayDiv;



    // *********************************************************************
    //  CREATE RABBIT MARKER
    //      if we haven't already defined the Rabbit Marker
    //      then we should create it and save a reference
    //      in our rabbitMarker variable so we can add/remove it later
    // *********************************************************************
    if (rabbitMarker === undefined) {

        const rabbitIcon = L.icon(rabbitIconOptions);
        
        // create a leaflet marker with the icon to an arbitrary location on the map (i.e. [0,0])
        rabbitMarker = new L.Marker([0,0], {icon:rabbitIcon}).addTo(map);

        // by default we don't want to see the marker
        rabbitMarker.remove();

        if(showRabbitIntroPopupMessage){
            initializeRabbitIntroPopup();
        }

        // map.hasLayer(${layer_name}) will let us know if the layer is currently added to the map
        // console.log(map.hasLayer(rabbitMarker));
    }



}


// ****************************************************************
//     Set-up Rabbit Popup -- only used in index-main.js currently
// ****************************************************************
function initializeRabbitIntroPopup(){
  
    // popup properties to set maxWidth
    const rabbitBindPopupProperties = {maxWidth: 125};
  
    // create main internal container for popup
    let div = L.DomUtil.create('div', 'd-flex flex-column');
  
    // add some informative HTML about what the rabbit is doing
    div.innerHTML = `
      <div>
        <h3 style="text-align:center;margin-bottom:8px;">Hi! I'm the BikeLapse Rabbit!</h3>
        <span">I will show you on the map where you were in the video!<br>
        It's a magical world we live in is it not?<br>
        Enjoy the ride!</span>
      </div>`;
      
    // create a button to start the rabbit moving
    let button = L.DomUtil.create('button', 'btn btn-outline-info btn-block btn-sm mt-2', div);
    
    button.setAttribute('id', 'rabbit-start-button');
  
    button.textContent = "Start BikeLapse";
  
    button.onclick = setRabbitPopupContentToPlayPauseButton;
  
    rabbitMarker.bindPopup(div, rabbitBindPopupProperties);

    // console.log(rabbitMarker);
  
}
  

function setRabbitPopupContentToPlayPauseButton(pressPlay = true){

    let rabbitPlayPauseButton = L.DomUtil.create('button', 'play-pause-button');

    yt_addPlayPauseButton(rabbitPlayPauseButton);

    rabbitMarker.setPopupContent(rabbitPlayPauseButton);

    // console.log(rabbitMarker);

    if(pressPlay){
        yt_playYouTubeVideo();
    }

    showRabbitIntroPopupMessage = false;
    
}


/* ################################################################################################
   ****  LEGEND "ON ADD" FUNCTION 
   ****     THIS IS OUR CUSTOM FUNCTION TO GENERATE A LEGEND WITHIN A CONTROL LAYER
   ****     IT IS CALLED WHEN WE ADD THE LEGEND CONTROL LAYER TO THE MAP
################################################################################################### */
function legendOnAdd(map) {

    // create a div for the legend
    let div = L.DomUtil.create('div', 'info legend');

    // add the innerHTML
    div.innerHTML = `
    <strong>Ride Types</strong><br>
    <i class="${mapIcons["DETAILS-BIKELAPSE"].legendClass}"></i>${mapIcons["DETAILS-BIKELAPSE"].displayText}<br>
    <i class="${mapIcons["DETAILS-REGULAR"].legendClass}"></i>${mapIcons["DETAILS-REGULAR"].displayText}
    
    
    <div style="margin-top:8px;">
        <strong>Markers</strong><br>
    </div>
    <i class="${mapIcons["START"].iconURLorClass}"></i>${mapIcons["START"].displayText}<br>
    <i class="${mapIcons["FINISH"].iconURLorClass}"></i>${mapIcons["FINISH"].displayText}<br>
    <div data-text="BIKELAPSE ONLY: Rabbit shows on the map where you were in the video" class="rabbit-tooltip"><i class="${mapIcons["RABBIT"].legendClass}"></i>
    <span >${mapIcons["RABBIT"].displayText}</span></div>
    `;
    
    div.innerHTML = div.innerHTML + 
                    `<div style="margin-top:8px;">
                    <strong style="margin-top:10px;">Units</strong><br>
                    </div>`;
    
    div.innerHTML = div.innerHTML + createUnitsToggleHTML();

    return div;
    
}


function createUnitsToggleHTML(){

    let metricActive = (displayUnits === "metric") ? true : false;

    const unitsToggleHTML = `
    <div id="units-radio-buttons" class="btn-group btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-secondary btn-sm ${(metricActive ? "active" : "")}">
            <input type="radio" name="units" id="units-metric" value="metric" autocomplete="off" ${(metricActive ? "checked" : "")}>Metric
        </label>
        <label class="btn btn-secondary btn-sm ${(!metricActive ? "active" : "")}">
            <input type="radio" name="units" id="units-imperial" value="imperial" autocomplete="off" ${(!metricActive ? "checked" : "")}>Imperial
        </label>
    </div>
    `;

    return unitsToggleHTML;

}



// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************

// **************** RETURN "true" IF IT'S NIGHT OR NOT ******************
  // checks to see if the local time is between 8pm and 6am
  // if so, we are considering it to be night time
function getIsNight(){
    let todaysDate = new Date();
  
    let HH = String(todaysDate.getHours()).padStart(2, '0');
  
    // if the current hour is between 8pm (20:00) and 6am, set isNight to true
    let isNight = (HH >= 20 || HH <= 6);
  
    return isNight;
  }
  