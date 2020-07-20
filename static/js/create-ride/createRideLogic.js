let gpxImportButtonFileNameLabel = document.getElementById('file-name-disp-text');
let outputTextarea = document.getElementById('output-textarea');

let geoJSON = undefined;
let rideMetadata = undefined;

// **************************************************************************
//     CONVERT THE GPX FILE TEXT OBJECT TO GEOJSON USING "toGeoJSON" LIBRARY
// **************************************************************************
function renameLineStringToROUTE(tempGeoJson) {

    if(tempGeoJson.features.length === 1 && tempGeoJson.features[0].geometry.type === "LineString"){
        tempGeoJson.features[0].properties.name = "ROUTE";
    }
    else{
        alert("GeoJSON generated from GPX file has more (or fewer) than one feature in its FeatureCollection and the first one is not a LineString\n" +
              "features.length == " + tempGeoJson.features.length + "\n" +
              "features[0].geometry.type == " + tempGeoJson.features[0].geometry.type
             );
    }

}

// CREATE THE METADATA OBJECT THAT WE ARE GOING TO ADD TO THE GEOJSON 
// DO THIS BY BY GETTING INFORMATION FROM THE USER INPUTS IN THE "RIDE INFO" SECTION
function getMetadataFromInputs(){

    let metadata = {    
        "rideName": document.getElementById('rideName').value,
        "rideType": ( function() {
            // get reference to all radios with name "rideType"
            // NOTE: this returns a NodeList object, not an Array
            let radios = document.getElementsByName('rideType');
            let checkedRadioValue = undefined;

            // need to use a for loop because radios is a NodeList not an Array
            for (let i = 0; i < radios.length; i++) {
                if(radios[i].checked){
                    checkedRadioValue = radios[i].value;
                }
            }
        
            return checkedRadioValue;
        })(),
        "videoEmbedID": document.getElementById('videoEmbedID').value,
        "stravaURL": document.getElementById('stravaURL').value,
        "googleMapURL": document.getElementById('googleMapURL').value,
        "lineColor": "rgba(62, 146, 204, 1)",
        "lineColorEasy": "green",
        "lineColorHard": "red"
    }

    // console.log(metadata);

    return metadata;
}

// THIS IS THE FUNCTION THAT GENERATES THE START AND FINISH FEATURES
// SO WE CAN ADD THEM TO THE GEOJSON AND THEY WILL APPEAR ON OUR MAP
// Add START/FINISH points
// name: START | FINISH
// description: 
//      Location Name: <pulled from form input>
//      time: <pulled from from first/last index of "coordTimes" list in "properties" of LineString feature>
//      Location Elevation: <pulled from from first/last coordinates of LineString feature>
function createPointFeature(tempGeoJson, pointName){

    // get the LineString Feature with name "ROUTE" from the Features array in the GeoJSON object
    let routeLineString = tempGeoJson.features.find( (feature) => feature.properties.name === "ROUTE");
    
    // get the coordTimes and coordinates arrays from the ROUTE LineString
    let routeCoordTimes = routeLineString.properties.coordTimes;
    let routeCoordinates = routeLineString.geometry.coordinates;

    // do a cheeky little check to see if they are the same length and print to the console.log if they are not
    if(routeCoordTimes.length !== routeCoordinates.length){
        console.log("coordTimes and coordinates arrays are not of the same length");
        console.log("coordTimes Array Length: ", routeCoordTimes.length);
        console.log("coordinates Array Length: ", routeCoordinates.length);
    }

    // create placeholders for the information we want to show on the pin
    let locationName = "";
    let pointCoordTime = "";
    let pointCoords = [];

    // fill in the information based on if it's a START or FINISH point feature
    switch (pointName) {
        case 'START':
            locationName = document.getElementById('startLocationName').value
            pointCoordTime = routeCoordTimes[0];
            pointCoords = routeCoordinates[0];
          break;
        case 'FINISH':
            locationName = document.getElementById('finishLocationName').value
            pointCoordTime = routeCoordTimes[routeCoordTimes.length - 1];
            pointCoords = routeCoordinates[routeCoordinates.length - 1];
          break;
        case 'DETAILS':
            pointCoords = routeCoordinates[Math.round(routeCoordinates.length/2)];
          break;
        default:
            console.log("Point Name not recognized");
      }

    // the HTML description should look like this: 
    //      Location Name: <pulled from form input>
    //      Time: <pulled from from first/last index of "coordTimes" list in "properties" of LineString feature>
    //      Elevation: <pulled from from first/last coordinates of LineString feature>
    let pointFeature = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": pointCoords
            },
            "properties": {
              "name": pointName,
              "description": (pointName === "DETAILS") ? createDetailsDescription(routeLineString) : "<b>Location Name:</b> " + locationName + "<br>" +
                                                                                      "<b>Time:</b> " + pointCoordTime + "<br>" +
                                                                                      "<b>Elevation:</b> " + pointCoords[2]
            }
          }

    console.log(pointName, " Point Feature: ", pointFeature);

    return pointFeature;

}

// this is the function where we create description for the DETAILS pin
// the description is made up of calculations from the data in the route LineString
//      Time: Sunday, June 21, 2020 9:20 AM PDT<br>
//      Distance: 26.38 miles<br>
//      Duration: 3 hours, 11 minutes, and 11 seconds<br>
//      Average Speed: 10.8 mph<br>
//      Minimum Elevation: 24 feet<br>
//      Maximum Elevation: 599 feet<br>
//      Total climb: 1526 feet<br>
//      Total descent: 100 feet
function createDetailsDescription(routeLineString){
    return "<b>Time:</b> " + routeLineString.properties.time + "<br>" +
           "<b>Distance:</b> " + "<br>" +
           "<b>Duration:</b> " + "<br>" +
           "<b>Average Speed:</b> " + "<br>" +
           "<b>Minimum Elevation:</b> " + "<br>" +
           "<b>Maximum Elevation:</b> " + "<br>" +
           "<b>Total climb:</b> " + "<br>" +
           "<b>Total descent:</b> ";
}





// THIS IS THE FUNCTION THAT TAKES THE GEOJSON (THAT WAS CREATED BY CONVERTING THE GPX FILE)
// AND ADDS INFORMATION TO IT SO THAT IT ADHERES TO THE CORRECT SPECIFICATIONS FOR THE BIKELAPSE WEBSITE
function addSupplementalGeoJSONFeatures(tempGeoJson){

    // add metadata from form inputs
    tempGeoJson["metadata"] = getMetadataFromInputs();

    // rename linestring to ROUTE, create an alert if conditions are not met
    // return the LineString Feature
    renameLineStringToROUTE(tempGeoJson);
    
    // create Point Features for START/FINISH/DETAILS
    let startPoint = createPointFeature(tempGeoJson, "START");
    let finishPoint = createPointFeature(tempGeoJson, "FINISH");
    let detailsPoint = createPointFeature(tempGeoJson, "DETAILS");

    tempGeoJson.features.push(startPoint);
    tempGeoJson.features.push(finishPoint);
    tempGeoJson.features.push(detailsPoint);

}


// **************************************************************************
//     CONVERT THE GPX FILE TEXT OBJECT TO GEOJSON USING "toGeoJSON" LIBRARY
// **************************************************************************
function convertFileToGeoJSON(gpxXMLFileText, fileName) {
    
    // update the label below the GPX file import button to indicate file is loading
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br>loading...";

    // create a DOMParser to parse the GPX file in XML format
    let dom = new DOMParser().parseFromString(gpxXMLFileText, "application/xml");

    let error = dom.querySelector("parsererror");
    if (error) throw new Error(error.innerText);

    // convert GPX to GeoJSON with "toGeoJSON" library
    let tempGeoJson = toGeoJSON.gpx(dom);

    // update the label below the GPX file import button to indicate the name of the file that was imported
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br><b>File Imported:</b><br>" + fileName;
    
    geoJSON = undefined;
    addSupplementalGeoJSONFeatures(tempGeoJson);

    // write output to textarea
    outputTextarea.value = JSON.stringify(tempGeoJson, null, 4);

}

// ****************************************************************
//     IMPORT THE SELECTED GPX FILE AND READ IT IN AS TEXT
//     CALL THE "convertFileToGeoJSON" FUNCTION TO CONVERT IT
// ****************************************************************
function handleFileSelection() {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } 
    else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // Get reference to the Selected File from the event
    const selectedFile = event.target.files[0];

    // check to see if the file exists
    if(selectedFile){

        // update the "choose file" button subtext to indicate file is being loaded
        gpxImportButtonFileNameLabel.innerHTML = "<b>Importing file...</b>";

        // create a new FileReader
        const reader = new FileReader();

        // attach an "onload" event listener function
        reader.onload = function(event) {
            convertFileToGeoJSON(event.target.result, selectedFile.name);
        };

        // Read in the file as text
        reader.readAsText(selectedFile);
    }
    else{
        console.log("file not loaded");

        // update the "choose file" button subtext to indicate something went wrong with file loading
        gpxImportButtonFileNameLabel.innerHTML = "<b>Error loading file</b>";
    }

}


// SETUP THE FILE INPUT SELECTION EVENT HANDLER
// d3.select("#filein").on("change", handleFileSelection);
// document.getElementById('filein').addEventListener("change", handleFileSelection);
document.getElementById('filein').onchange = handleFileSelection;
document.getElementById('export-button').onclick = getMetadataFromInputs;













