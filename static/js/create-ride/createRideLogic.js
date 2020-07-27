let gpxImportButtonFileNameLabel = document.getElementById('file-name-disp-text');
let gpxTextarea = document.getElementById('gpx-textarea');
let geoJsonTextarea = document.getElementById('geojson-textarea');

// initialize a global variable to hold the serialized GPX (XML) output file
let gpxFileXmlDocDom;
let canExportGeoJson = true;

// **************************************************************************
//     CONVERT THE GPX FILE TEXT OBJECT TO GEOJSON USING "toGeoJSON" LIBRARY
// **************************************************************************

// Rename the LineString to "ROUTE"
function renameLineStringToROUTE(tempGeoJson) {

    // first make sure there's only one feature in the GeoJSON and that feature is a LineString
    // then rename it's properties.name member to "ROUTE"
    if(tempGeoJson.features.length === 1 && tempGeoJson.features[0].geometry.type === "LineString"){
        tempGeoJson.features[0].properties.name = "ROUTE";
    }
    else{
        alert('GeoJSON generated from GPX file has more (or fewer) than one feature in its FeatureCollection and the first one is not a LineString\n' +
              'features.length == ' + tempGeoJson.features.length + '\n' +
              'features[0].geometry.type == ' + tempGeoJson.features[0].geometry.type
             );
    }

}

// CREATE THE METADATA OBJECT THAT WE ARE GOING TO ADD TO THE GEOJSON 
// DO THIS BY BY GETTING INFORMATION FROM THE USER INPUTS IN THE "RIDE INFO" SECTION
function getUserInputsFromTextFields(){

    let rideInfo = {    
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

    let startLocationName = document.getElementById('startLocationName').value;
    let finishLocationName = document.getElementById('finishLocationName').value;

    return { 
                "rideInfo": rideInfo, 
                "startName": startLocationName,
                "finishName": finishLocationName
           };
}

// THIS IS THE FUNCTION THAT GENERATES THE START AND FINISH FEATURES
// SO WE CAN ADD THEM TO THE GEOJSON AND THEY WILL APPEAR ON OUR MAP
// Add START/FINISH points
// name: START | FINISH
// description: 
//      Location Name: <pulled from form input>
//      time: <pulled from from first/last index of "coordTimes" list in "properties" of LineString feature>
//      Location Elevation: <pulled from from first/last coordinates of LineString feature>
function createPointFeature(tempGeoJson, pointName, pointLocationName = 'Location Name'){

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
    let pointTime = '';
    let pointCoords = [];

    // fill in the information based on if it's a START or FINISH point feature
    switch (pointName) {
        case "START":
            pointTime = routeCoordTimes[0];
            pointCoords = routeCoordinates[0];
          break;
        case "FINISH":
            pointTime = routeCoordTimes[routeCoordTimes.length - 1];
            pointCoords = routeCoordinates[routeCoordinates.length - 1];
          break;
        case "DETAILS":
            pointTime = routeLineString.properties.time;    
            pointCoords = routeCoordinates[Math.round(routeCoordinates.length/2)];
          break;
        default:
            console.log("Point Name not recognized");
      }

    // format the pointTime to look like this -> 1:32 PM on Saturday, November 16, 2019
    let formattedDateTimeString = moment(pointTime).format("h:mm A [on] dddd, MMMM Do, YYYY");


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
              "description": (pointName === "DETAILS") ? createDetailsDescription(routeLineString, formattedDateTimeString) : '<b>Location Name:</b> ' + pointLocationName + '<br><br>' +
                                                                                      '<b>Time:</b> ' + formattedDateTimeString + '<br>' +
                                                                                      '<b>Elevation:</b> ' + Math.round(pointCoords[2]*3.28084) + ' feet &nbsp (' + Math.round(pointCoords[2]) + ' meters)'
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

    return '<b>Start Time:</b> ' + formattedStartTimeString + '<br>' +
           '<b>Distance:</b> ' + linestringDistance.mi + ' miles &nbsp (' + linestringDistance.km + ' km)<br>' +
           '<b>Duration:</b> ' + linestringDuration.string + '<br>' +
           '<b>Average Speed:</b> ' + avgSpeed.mph + ' mph &nbsp (' + avgSpeed.kph + ' kph)<br>' +
           '<b>Minimum Elevation:</b> ' + elevationStats.min_ft + ' feet &nbsp (' + elevationStats.min_m + ' meters)<br>' +
           '<b>Maximum Elevation:</b> ' + elevationStats.max_ft + ' feet &nbsp (' + elevationStats.max_m + ' meters)<br>' +
           '<b>Total Climb:</b> ' + elevationStats.gain_ft + ' feet &nbsp (' + elevationStats.gain_m + ' meters)<br>' +
           '<b>Total Descent:</b> ' + elevationStats.descent_ft + ' feet &nbsp (' + elevationStats.descent_m + ' meters)';
}


// THIS IS THE FUNCTION THAT TAKES THE GEOJSON (THAT WAS CREATED BY CONVERTING THE GPX FILE)
// AND ADDS INFORMATION TO IT SO THAT IT ADHERES TO THE CORRECT SPECIFICATIONS FOR THE BIKELAPSE WEBSITE
function addSupplementalGeoJSONFeatures(tempGeoJson){

    // rename linestring to ROUTE, create an alert if conditions are not met
    // return the LineString Feature
    renameLineStringToROUTE(tempGeoJson);

    // get all the user input from the text fields
    let userInput = getUserInputsFromTextFields();

    // add metadata from form inputs
    tempGeoJson["metadata"] = userInput.rideInfo;
    
    // create Point Features for START/FINISH/DETAILS
    let startPoint = createPointFeature(tempGeoJson, "START", userInput.startName);
    let finishPoint = createPointFeature(tempGeoJson, "FINISH", userInput.finishName);
    let detailsPoint = createPointFeature(tempGeoJson, "DETAILS");

    tempGeoJson.features.push(startPoint);
    tempGeoJson.features.push(finishPoint);
    tempGeoJson.features.push(detailsPoint);

    return tempGeoJson;

}



// ****************************************************************
//     IMPORT THE SELECTED GPX FILE AND READ IT IN AS TEXT
//     CALL THE "combineXMLFilesAndConvertToGeoJSON" FUNCTION TO CONVERT IT
// ****************************************************************
function handleGpxFileSelectionCombineAndConvertToGeoJson(e) {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } 
    else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // Get reference to the Selected File(s) from the event
    const selectedFiles = e.target.files;
    const numFilesSelected = selectedFiles.length;

    // console.log("num files selected ", numFilesSelected);

    // let the user know we've received their request to import the file(s) and it might take a couple seconds to finish loading them
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + '<br><b>Importing ' + numFilesSelected + ' files</b><br>' +
                                             'this should only take a few seconds...';


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
            gpxImportButtonFileNameLabel.innerHTML = '<b>Error loading file</b>';
        }
    }

    
    function combineXMLFilesAndConvertToGeoJSON(){
        
        //******* Let the user know the file import worked **********************************
        //******* and that we're now attempting to convert them *****************************
        // update the GPX Import button label text to show that the files have been imported
        gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + '<br><br><b>SUCCESS!!!<br>File(s) Imported:</b><br>'
        selectedFilesNames.forEach((fileName, i) => {
            // update the label below the GPX file import button to indicate the name of the file that was imported
            gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + String(i+1) + ') ' + fileName + '<br>';
        });
        gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + '<br>Converting to GeoJson'        

        //******* Combine GPX/XML Files ************************************************
        // (or just return the one provided if there's only one)
        let tempXmlDocDom = combineXMLFiles(selectedFilesText);
        
        //******* Convert GPX/XML to GeoJSON with "toGeoJSON" library ******************
        let tempGeoJson = toGeoJSON.gpx(tempXmlDocDom);

        // rename LineString to "ROUTE"
        // get user input from text fields
        // add "metadata" object with those user inputs
        // add "START" and "FINISH" points with user inputs
        // add "DETAILS" point with ride details calculated from GeoJson
        let modifiedTempGeoJson = addSupplementalGeoJSONFeatures(tempGeoJson);
        
        //******** Print GPX and GeoJson Contents to Textareas *************************
        // print out the contents of the final "gpx" AND "GeoJSON" files
        showGPXInTextArea(tempXmlDocDom);
        showGeoJSONInTextArea(modifiedTempGeoJson);

        //******* Load temporary GPX and GeoJson objects into Globally accessible variables *****************
        // load the ridesData Object with a single ride 
        // who's key is stored in the global variable createRideInterfaceRideID
        // and value is the GeoJSON we just created
        ridesData[currentRideID] = modifiedTempGeoJson;
        gpxFileXmlDocDom = tempXmlDocDom;

        //******* Let the user know the conversion worked **********************************
        gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + '<br>Adding to map'

        //******** Display ride GeoJson on the map *************************************
        addRideToMap();

        //******* Let the user know the adding to map worked **********************************
        gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + '<br><b>DONE</b><br><br>(Reload page to import again)'

        // disable the GPX import button
        document.getElementById('gpx-import-button').disabled = true;

        // update "Save Changes" button display
        unsavedChanges(false);

    }


}



function showGPXInTextArea(gpxDocDom){

    // if a DocDom was passed in, use it, otherwise use the globally defined one
    let gpxDocDomToOutput = (gpxDocDom !== undefined) ? gpxDocDom : gpxFileXmlDocDom;

    // serialize the DocDom in order to print to the textarea
    gpxTextarea.value = new XMLSerializer().serializeToString(gpxDocDomToOutput);
    

}

function showGeoJSONInTextArea(geoJson){

    // if a GeoJson was passed in, use it, otherwise use the globally defined one
    let geoJsonToOutput = (geoJson !== undefined) ? geoJson : ridesData[currentRideID];
    
    // stringify the GeoJson in order to print to the textarea
    geoJsonTextarea.value = JSON.stringify(geoJsonToOutput, null, 4);

}

// unhides the "Update" and "Download" button containers
// after we've imported a GPX file
function unsavedChanges(unsavedChanges){

    document.getElementById('save-changes-button').disabled = !unsavedChanges;
    
    let notificationText = (unsavedChanges) ? 'unsaved changes' : '';

    document.getElementById('save-changes-button-notification-text').innerHTML = notificationText;    

}

// this function enables or disables the GeoJsonExport button
// if the user changes form inputs we want them to click "Update"
// before exporting
function setDownloadButtonsDisabled(disabled){

    // let geoJsonNotificationText = (disabled) ? '' : 'unsaved changes';
    // document.getElementById('save-changes-button-notification-text').innerHTML = geoJsonNotificationText;

    document.getElementById('geojson-download-button').disabled = disabled;
    document.getElementById('gpx-download-button').disabled = disabled;

}





// Called when someone pushes the Update button
//
function saveChangesButtonHandler(e){

    // check to make sure the GeoJson has been created first
    if(ridesData[currentRideID] !== undefined){
        // get user inputs from text fields
        let userInput = getUserInputsFromTextFields();

        // replace fields in GeoJson with user inputs from text fields
        ridesData[currentRideID].metadata = userInput.rideInfo;
        
        // get a reference to the GeoJson object for easier to read code
        let tempGeoJson = ridesData[currentRideID];

        // loop through all the features in the GeoJson
        // replace the description for the features who's names are "START" and "FINISH" 
        tempGeoJson.features.forEach( (feature) => {

            let featureName = feature.properties.name;

            switch (featureName) {
                case "START":
                case "FINISH":
                    // if the feature's name is "START" use the user input from the Start Name box
                    // otherwise use the user input from the Finish Name box
                    let newLocationName = (featureName === "START") ? userInput.startName : userInput.finishName;
                    
                    // create a new point feature of type "featureName" and set the location to "newLocationName"
                    let newPointFeature = createPointFeature(tempGeoJson, featureName, newLocationName);

                    // replace the existing properties.description for this point with the new one
                    feature.properties.description = newPointFeature.properties.description;
                    break;
            }
    
        });        

        // print GeoJson to textarea
        showGeoJSONInTextArea(ridesData[currentRideID]);
        
        addRideToMap("update");
        
        //******** update save button and clear helper text *********************************
        unsavedChanges(false);
    }
    else{
        alert('Please import a GPX file first');
        console.log("rides data is of type: ", typeof(ridesData[currentRideID]));
    }

    
}


// handle the download button presses and download the correct file according to which button was pressed
function downloadButtonHandler(e){

    // check to make sure the GeoJson has been created first
    if(ridesData[currentRideID] !== undefined){

        // get the routeLineString from the rideData 
        let routeLineString = ridesData[currentRideID].features.find( (feature) => 
                                                                            feature.properties.name === "ROUTE"
                                                                            && feature.geometry.type === "LineString"
                                                                    );

        // pull the ISO date time so we can use for the file name later
        let rideTime = routeLineString.properties.time;
        let rideName = ridesData[currentRideID].metadata.rideName;
        let fileExtension = "";
        let fileContents = "";

        switch (e.target.id) {
            case 'geojson-download-button':
                fileExtension = '.json';
                fileContents = geoJsonTextarea.value;
                break;
            case 'gpx-download-button':
                fileExtension = '.gpx';
                fileContents = gpxTextarea.value;
                break;
        }

        // use moment to turn the rideTime string into a new string that we will use for the prefix of the filename
        // it will look something like this "2020_07_23--"
        let fileNameDatePrefix = moment(rideTime).format('YYYY[_]MM[_]DD[--]');

        // if the ride name is an empty string, give it a name
        // otherwise replace all spaces with underscores
        // and lastly add the file extension to the end
        let filename = fileNameDatePrefix + ( (rideName === '') ? 'BikeLapseRideData' :  rideName.replace(/\s+/g, '_').toLowerCase() ) + fileExtension;

        // console.log(filename);

        // Generate download of file with fileContents as content
        download(filename, fileContents);
    }
    else{
        alert('Please import a GPX file first');
        console.log("rides data is of type: ", typeof(ridesData[currentRideID]));
    }
    
}

// a hacky way that the internet taught me to be able to download text files
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// a hacky way to deal with the fact that File input buttons can't be styled
// so we create a file input in the HTML file, make it hidden
// then put a nice looking button in its place
// when that button is clicked we just send a click message to the file input
function handleGPXButtonClick(e){
    document.getElementById('filein').click();
}

// if the user has changed one of the form fields
// then we want to update the "Saved Changes" button and text label
function handleFormChanges(e){

    // if we've imported data and are therefore displaying it in the map then carry out the event
    if(ridesData[currentRideID] !== undefined){

        if(e.type === "keyup" || (e.type === "change" && e.target.type === "radio") ){
            unsavedChanges(true);
            // document.getElementById('save-changes-button').disabled = false;
        }
    }
    else{
        // console.log("gpx import still enabled");
    }

}


// SETUP THE FILE INPUT SELECTION EVENT HANDLER
// d3.select("#filein").on("change", handleFileSelection);
// document.getElementById('filein').addEventListener("change", handleFileSelection);


// handlers for when gpx-import-button is clicked
document.getElementById('gpx-import-button').onclick = handleGPXButtonClick;
document.getElementById('filein').onchange = handleGpxFileSelectionCombineAndConvertToGeoJson;


document.getElementById('ride-info-form').onchange = handleFormChanges;
document.getElementById('ride-info-form').onkeyup = handleFormChanges;

// save changes button click handler
document.getElementById('save-changes-button').onclick = saveChangesButtonHandler;

// download button click handlers
document.getElementById('geojson-download-button').onclick = downloadButtonHandler;
document.getElementById('gpx-download-button').onclick = downloadButtonHandler;
