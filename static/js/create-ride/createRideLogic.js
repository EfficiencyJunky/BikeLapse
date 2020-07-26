let gpxImportButtonFileNameLabel = document.getElementById('file-name-disp-text');
let outputTextarea = document.getElementById('output-textarea');

let rideMetadata = undefined;

// let selectedFiles;

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

    // get the LineString Feature from the Features array in the GeoJSON object
    // who's properties.name "ROUTE" and geometry.type is "LineString" 
    let routeLineString = tempGeoJson.features.find( (feature) => 
                                                            feature.properties.name === "ROUTE"
                                                            && feature.geometry.type === "LineString"
                                                    );
    
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
    let pointTime = "";
    let pointCoords = [];

    // fill in the information based on if it's a START or FINISH point feature
    switch (pointName) {
        case 'START':
            locationName = document.getElementById('startLocationName').value
            pointTime = routeCoordTimes[0];
            pointCoords = routeCoordinates[0];
          break;
        case 'FINISH':
            locationName = document.getElementById('finishLocationName').value
            pointTime = routeCoordTimes[routeCoordTimes.length - 1];
            pointCoords = routeCoordinates[routeCoordinates.length - 1];
          break;
        case 'DETAILS':
            pointCoords = routeCoordinates[Math.round(routeCoordinates.length/2)];
            pointTime = routeLineString.properties.time;
          break;
        default:
            console.log("Point Name not recognized");
      }

    // format the pointTime to look like this -> 1:32 PM on Saturday, November 16, 2019
    let formattedDateTimeString = moment(pointTime).format("h:mm A [on] dddd, MMMM Do, YYYY");

    // console.log("moment formatted time string: ", formattedDateTimeString);


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
              "description": (pointName === "DETAILS") ? createDetailsDescription(routeLineString, formattedDateTimeString) : "<b>Location Name:</b> " + locationName + "<br>" +
                                                                                      "<b>Time:</b> " + formattedDateTimeString + "<br>" +
                                                                                      "<b>Elevation:</b> " + Math.round(pointCoords[2]*3.28084) + " feet &nbsp (" + Math.round(pointCoords[2]) + " meters)"
            }
          }

    // console.log(pointName, " Point Feature: ", pointFeature);

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
function createDetailsDescription(routeLineString, formattedStartTimeString){

    let linestringDistance = getDistance(routeLineString.geometry.coordinates, 6, latLonReversed = true);
    let linestringDuration = getDuration(routeLineString.properties.coordTimes);
    let avgSpeed = getAvgSpeed(linestringDuration, linestringDistance);
    let elevationStats = getElevationStats(routeLineString.geometry.coordinates);

    // console.log(linestringDuration.hours);

    return "<b>Start Time:</b> " + formattedStartTimeString + "<br>" +
           "<b>Distance:</b> " + linestringDistance.mi + " miles &nbsp (" + linestringDistance.km + " km)<br>" +
           "<b>Duration:</b> " + linestringDuration.string + "<br>" +
           "<b>Average Speed:</b> " + avgSpeed.mph + " mph &nbsp (" + avgSpeed.kph + " kph)<br>" +
           "<b>Minimum Elevation:</b> " + elevationStats.min_ft + " feet &nbsp (" + elevationStats.min_m + " meters)<br>" +
           "<b>Maximum Elevation:</b> " + elevationStats.max_ft + " feet &nbsp (" + elevationStats.max_m + " meters)<br>" +
           "<b>Total Climb:</b> " + elevationStats.gain_ft + " feet &nbsp (" + elevationStats.gain_m + " meters)<br>" +
           "<b>Total Descent:</b> " + elevationStats.descent_ft + " feet &nbsp (" + elevationStats.descent_m + " meters)";
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

    return tempGeoJson;

}


// **************************************************************************
//     CONVERT THE GPX FILE TEXT OBJECT TO GEOJSON USING "toGeoJSON" LIBRARY
// **************************************************************************
// function convertFileToGeoJSON(gpxXMLFileText) {
    
//     // update the label below the GPX file import button to indicate file is loading
//     // gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br>loading...";

//     // create a DOMParser to parse the GPX file in XML format
//     let dom = new DOMParser().parseFromString(gpxXMLFileText, "application/xml");

//     let error = dom.querySelector("parsererror");
//     if (error) throw new Error(error.innerText);

//     // convert GPX to GeoJSON with "toGeoJSON" library
//     let tempGeoJson = toGeoJSON.gpx(dom);
    
//     addSupplementalGeoJSONFeatures(tempGeoJson);
    
//     // load the ridesData Object with a single ride who's key is "currentRideID" and value is the GeoJSON
//     return tempGeoJson;

//     // find the Feature who's geometry.type is "LineString" and properties.name is "ROUTE"
//     // then grab it's coordinates array from geometry.coordinates
//     // let routeLinestringCoordsArray = (tempGeoJson.features.find( (feature) => 
//     //                                                                 feature.geometry.type === "LineString"
//     //                                                                 && feature.properties.name === "ROUTE" 
//     //                                                             )).geometry.coordinates;

//     // let linestringDistance = getDistance(routeLinestringCoordsArray, 6, latLonReversed = true);
    
//     // console.log("distance mi == ", linestringDistance.km);
//     // console.log("distance km == ", linestringDistance.mi);

// }





// ****************************************************************
//     IMPORT THE SELECTED GPX FILE AND READ IT IN AS TEXT
//     CALL THE "combineXMLFilesAndConvertToGeoJSON" FUNCTION TO CONVERT IT
// ****************************************************************
function handleMultipleFileSelections() {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } 
    else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // Get reference to the Selected File(s) from the event
    const selectedFiles = event.target.files;
    const numFilesSelected = selectedFiles.length;

    // console.log("num files selected ", numFilesSelected);

    // let the user know we've received their request to import the file(s) and it might take a couple seconds to finish loading them
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br><b>Importing " + numFilesSelected + " files</b><br>" +
                                             "this should only take a few seconds...";


    // need to make an asyncCounter that will trigger the "combineXMLFilesAndConvertToGeoJSON" function
    // only once all of the files are completely finished being read as text
    let filesLoadedCounter = new asyncCounter(numFilesSelected, combineXMLFilesAndConvertToGeoJSON);

    // create empty arrays to be loaded with contents of the files and their names
    let selectedFilesText = [];
    let selectedFilesNames = [];

    for(let i=0; i < numFilesSelected; i++){

        // grab reference to the first file in the list
        const file = selectedFiles[i];

        // check to see if the file exists (probably don't need to do this but just in case)
        if(file){

            // create a new FileReader
            const reader = new FileReader();

            // attach an "onload" event listener function to the FileReader object
            // when the file text is finished being read as Text,
            // we want to push it to an Array with all of the files we're reading
            // we also want a separate Array with the name of the file (used for displaying names of files imported later)
            // then we need to update the AsyncCounter object to kick off the "combineXMLFilesAndConvertToGeoJSON" function
            // once all the files are finished being loaded
            reader.onload = function(event) {
                selectedFilesText.push(event.target.result);
                selectedFilesNames.push(file.name);
                filesLoadedCounter.increment();
            };

            // Read in the file as text and trigger the ".onload" function once it's done
            reader.readAsText(file);

        }
        else{
            console.log("file doesn't exist?");
    
            // update the "choose file" button subtext to indicate something went wrong with file loading
            gpxImportButtonFileNameLabel.innerHTML = "<b>Error loading file</b>";
        }
    }

    
    function combineXMLFilesAndConvertToGeoJSON(){

        //**************************** Combine XML Files and Convert to GeoJSON **********************************************************                    
        gpxFileXmlDocDom = combineXMLFiles(selectedFilesText);

        // convert GPX to GeoJSON with "toGeoJSON" library
        let tempGeoJson = toGeoJSON.gpx(gpxFileXmlDocDom);
        let finalGeoJson = addSupplementalGeoJSONFeatures(tempGeoJson);
        
        // load the ridesData Object with a single ride who's key is "currentRideID" and value is the GeoJSON
        ridesData[createRideInterfaceRideID] = finalGeoJson;


        //**************************** Print File Contents to Textarea **********************************************************
        // print out the file contents of either the final "gpx" OR "GeoJSON"
        // depending on how this variable is set
        let textOutputToShow = "gpx";
        // let textOutputToShow = "GeoJSON";
        
        if(textOutputToShow === "gpx"){
            let xmlFileOutput = new XMLSerializer().serializeToString(gpxFileXmlDocDom);
            outputTextarea.value = xmlFileOutput;
        }
        else if(textOutputToShow === "GeoJSON"){
            // if we haven't already printed the XML file (like if it's commented out above)
            // print out the GeoJSON file to the outputTextarea instead
            outputTextarea.value = JSON.stringify(ridesData[createRideInterfaceRideID], null, 4);
        }


        //**************************** Let the user know it all worked out **********************************************************
        // update the GPX Import button label text to show that the files have been imported
        gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br><br><b>SUCCESS!!!<br>File(s) Imported:</b><br>"
        selectedFilesNames.forEach((fileName, i) => {
            // update the label below the GPX file import button to indicate the name of the file that was imported
            gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + String(i+1) + ") " + fileName + "<br>";
        });

    }


}




// ****************************************************************
//     IMPORT THE SELECTED GPX FILE AND READ IT IN AS TEXT
//     CALL THE "convertFileToGeoJSON" FUNCTION TO CONVERT IT
// ****************************************************************
// function handleFileSelection() {

//     // Check for the various File API support.
//     if (window.File && window.FileReader && window.FileList && window.Blob) {
//     // Great success! All the File APIs are supported.
//     } 
//     else {
//         alert('The File APIs are not fully supported in this browser.');
//     }

//     // Get reference to the Selected File from the event
//     const selectedFile = event.target.files[0];
    
//     console.log("num files selected ", event.target.files.length);

//     selectedFiles = event.target.files;

//     selectedFile1 = event.target.files[0];
//     selectedFile2 = event.target.files[1];

//     // check to see if the file exists
//     if(selectedFile){

//         // update the "choose file" button subtext to indicate file is being loaded
//         gpxImportButtonFileNameLabel.innerHTML = "<br><b>Importing file...</b>";

//         // create a new FileReader
//         const reader = new FileReader();

//         // attach an "onload" event listener function
//         reader.onload = function(event) {
//             // console.log(selectedFile.name);
//             // console.log(event.target);

//             convertFileToGeoJSON(event.target.result);

//             // update the label below the GPX file import button to indicate the name of the file that was imported
//             gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br><br><b>SUCCESS!!!<br>File Imported:</b><br>" + selectedFile.name;
            
//         };

//         // Read in the file as text
//         reader.readAsText(selectedFile);
//     }
//     else{
//         console.log("file not loaded");

//         // update the "choose file" button subtext to indicate something went wrong with file loading
//         gpxImportButtonFileNameLabel.innerHTML = "<b>Error loading file</b>";
//     }

// }



function convertButtonHandler(){

    addRideToMap();

}




function showGPXInTextArea(){

    let xmlFileOutput = new XMLSerializer().serializeToString(gpxFileXmlDocDom);
    outputTextarea.value = xmlFileOutput;

}

function showGeoJSONInTextArea(){

    // need to make the export actually export a file
    outputTextarea.value = JSON.stringify(ridesData[createRideInterfaceRideID], null, 4);

    // outputTextarea.value = "exporting file";

}


function exportButtonHandler(e){
    console.log("Need to implement export button");
    
}


function clearButton(){

    if(createRideInterfaceRideID === elevationRideID){
        clearElevationDisplay(createRideInterfaceRideID);
    }
    
}


function funButton2Handler(e){
    // console.log("fun 2");
    if(ridesData[createRideInterfaceRideID] !== undefined){
        showElevationForRideID(createRideInterfaceRideID);
    }
}

// SETUP THE FILE INPUT SELECTION EVENT HANDLER
// d3.select("#filein").on("change", handleFileSelection);
// document.getElementById('filein').addEventListener("change", handleFileSelection);


// document.getElementById('filein').onchange = handleFileSelection;
document.getElementById('filein').onchange = handleMultipleFileSelections;
document.getElementById('convert-button').onclick = convertButtonHandler;
document.getElementById('export-button').onclick = exportButtonHandler;

document.getElementById('fun-button-1').onclick = clearButton;
document.getElementById('fun-button-2').onclick = funButton2Handler;


document.getElementById('show-gpx-in-textarea').onclick = showGPXInTextArea;
document.getElementById('show-geojson-in-textarea').onclick = showGeoJSONInTextArea;













