/* #############################################################################
// ************ GLOBAL VARIABLES and CLASS DECLARATIONS ************
// ************ GLOBAL VARIABLES and CLASS DECLARATIONS ************
// ************ GLOBAL VARIABLES and CLASS DECLARATIONS ************
################################################################################ */
// this is the object to hold our GeoJson that the user will download
let _geoJsonData;




// this will set whether we log the frame offset info to the console
// since we only want to log it once each time a new video is loaded
let _printFrameOffsetInfo = true;

// ******************************************************************* 
// ASYNCRONOUS COUNTER CLASS 
//    Triggers a callback when all asyncronous tasks have completed
//    Because we only want to call the callback
//    after all the API calls etc have finished running
// *******************************************************************     
class AsyncCounter {
    constructor(numCalls, callback){
        this.callback = callback;
        this.numCalls = numCalls;
        this.calls = 0;
    }

    increment(){
        this.calls += 1;
    
        if(this.calls === this.numCalls){
            this.callback();
        }
    }
}



/* #############################################################################
// ************ FUNCTIONS ************
// ************ FUNCTIONS ************
// ************ FUNCTIONS ************
################################################################################ */

// ############################################################################################
// *********  MAIN FUNCTION FOR IMPORTING/CONVERTING GPX FILE ****************
// ############################################################################################
// ****************************************************************
//     WHEN A USER CHOOSES ONE OR MORE GPX FILES WE NEED TO
//     READ THE SELECTED GPX FILE(S) INTO MEMORY AS A DOCDOMS, COMBINE THEM INTO ONE GPX FILE
//     CALL THE "combineXMLFilesAndConvertToGeoJSON" FUNCTION TO CONVERT IT
//     THEN DISPLAY THE OUTPUT CONTENTS OF THE GEOJSON AND GPX IN THE TEXTAREAS
// ****************************************************************
function handleGpxFileSelectionCombineAndConvertToGeoJson(event) {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } 
    else {
        alert('The File Import APIs are not fully supported in this browser.');
    }

    // Get reference to the Selected File(s) from the event
    const selectedFiles = event.target.files;
    const numFilesSelected = selectedFiles.length;


    // let the user know we've received their request to import the file(s) and it might take a couple seconds to finish loading them
    gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + '<br><b>Importing ' + numFilesSelected + ' files</b><br>' +
                                             'this should only take a few seconds...';


    // need to make an AsyncCounter that will trigger the "combineXMLFilesAndConvertToGeoJSON" function
    // only once all of the files are completely finished being read as text
    let filesLoadedCounter = new AsyncCounter(numFilesSelected, combineXMLFilesAndConvertToGeoJSON);

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
            gpxImportProgressLabel.innerHTML = '<b>Error loading file</b>';
        }
    }

    // WE NEEDED TO PUT THIS FUNCTION INSIDE THE "handleGpxFileSelectionCombineAndConvertToGeoJson" FUNCTION
    // IN ORDER TO MAINTAIN THE SCOPE OF "selectedFilesText" AND "selectedFilesNames" VARAIBLES
    function combineXMLFilesAndConvertToGeoJSON(){
        
        //******* Let the user know the file import worked **********************************
        //******* and that we're now attempting to convert them *****************************
        // update the GPX Import button label text to show that the files have been imported
        gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + '<br><br><b>SUCCESS!!!<br>File(s) Imported:</b><br>'

        selectedFilesNames.forEach((fileName, i) => {
            // update the label below the GPX file import button to indicate the name of the file that was imported
            gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + String(i+1) + ') ' + fileName + '<br>';
        });
        gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + '<br>Converting to GeoJson'        

        //******* Combine GPX/XML Files ************************************************
        // (or just return the one provided if there's only one)
        // combineXMLFiles() is located in the 'create-ride-gpx-parsing.js' file
        let tempXmlDocDom = combineXMLFiles(selectedFilesText);
        
        //******* Convert GPX/XML to GeoJSON with "toGeoJSON" library ******************
        let tempGeoJson = toGeoJSON.gpx(tempXmlDocDom);

        
        //******* Get user inputs and use it to create Points and Metadata ******************            
        // get user inputs from text fields
        const metadataAndPointNames = getMetadataAndPointNamesFromUserInputFields();


        // rename LineString to "ROUTE"
        // add "START" and "FINISH" points with user inputs
        // add "DETAILS" point
        // add Metadata from User Inputs
        // add rideStats calculated from linestring
        _geoJsonData = addGeoJSONPointFeaturesMetadataAndRideStats(tempGeoJson, metadataAndPointNames);


        //******** Print GPX and GeoJson Contents to Textareas *************************
        // print out the contents of the final "gpx" AND "GeoJSON" files
        // showGPXInTextArea(tempXmlDocDom);
        gpxTextarea.value = new XMLSerializer().serializeToString(tempXmlDocDom);
        showGeoJSONInTextArea(_geoJsonData);


        //******* Let the user know the conversion worked **********************************
        gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + '<br>Adding to map'

        //******** Display ride GeoJson on the map *************************************
        addRideToMap();

        //******* Let the user know the adding to map worked **********************************
        gpxImportProgressLabel.innerHTML = gpxImportProgressLabel.innerHTML + '<br><b>DONE</b><br><br>(Reload page to import again)'

        // disable the GPX import button
        document.getElementById('gpx-import-button').disabled = true;

        // update "Save Changes" button display since there are no unsaved changes anymore
        unsavedChanges(false);

    }

}



// #######################################################################################
// *********  HELPERS FOR THE MAIN FUNCTION ABOVE ****************
// #######################################################################################
// THIS IS THE FUNCTION THAT TAKES THE GEOJSON (THAT WAS CREATED BY CONVERTING THE GPX FILE)
// AND ADDS INFORMATION TO IT SO THAT IT ADHERES TO THE CORRECT SPECIFICATIONS FOR THE BIKELAPSE WEBSITE
function addGeoJSONPointFeaturesMetadataAndRideStats(tempGeoJson, metadataAndPointNames){

    // rename linestring to ROUTE, create an alert if conditions are not met
    // return the LineString Feature
    let routeLineString = renameLineStringToROUTE(tempGeoJson);

    // grab the metadata created from the user inputs
    tempGeoJson["metadata"] = metadataAndPointNames.rideMetadata;

    // add our frameoffset member
    tempGeoJson.metadata["frameOffset"] = undefined;

    // calculate ridestats    
    tempGeoJson.metadata["rideStats"] = getRideStats(routeLineString);

    // create Point Features for START/FINISH/DETAILS from the start/end and middle coordinate of the routeLineString
    let startPoint = createPointFeature(routeLineString, "START", metadataAndPointNames.startName);
    let finishPoint = createPointFeature(routeLineString, "FINISH", metadataAndPointNames.finishName);
    let detailsPoint = createPointFeature(routeLineString, "DETAILS");

    tempGeoJson.features.push(startPoint);
    tempGeoJson.features.push(finishPoint);
    tempGeoJson.features.push(detailsPoint);

    return tempGeoJson;

}


// Rename the LineString to "ROUTE" 
function renameLineStringToROUTE(tempGeoJson) {

    // first make sure there's only one feature in the GeoJSON
    if(tempGeoJson.features.length === 1){

        let feature = tempGeoJson.features[0];

        // then check to see that the single feature is a LineString and rename it's properties.name member to "ROUTE"
        if(feature.geometry.type === "LineString"){
            feature.properties.name = "ROUTE";

            // return the renamed feature
            return feature;
        }
        else{
            alert(  'The GeoJSON feature generated from GPX file is not a LineString\n' + 
                    'features[0].geometry.type == ' + feature.geometry.type
                 );
        }
    }
    else{
        alert('GeoJSON generated from GPX file has more (or fewer) than one feature in its FeatureCollection\n' +
              'features.length == ' + tempGeoJson.features.length
             );
    }


}




/* ##################################################################################################################################
    *******  SHARED HELPER FUNCTIONS ******* SHARED HELPER FUNCTIONS ******* 
                These functions are run when a new GPX file is imported
                OR when the "saveChangesButton" is clicked
##################################################################################################################################### */

// *********************************************************************************************************************
// GET USER INPUTS FROM TEXT FIELDS IN THE "RIDE INFO" FORM
//      This function creates the metadata object that we are going to add to the GeoJson
//      and saves the Start/finish location name in two other variables we will use when creating those points
// *********************************************************************************************************************
function getMetadataAndPointNamesFromUserInputFields(){

    // defining a function and calling it all at once because I'm lazy and dumb
    // this function just grabs the value of the checked radio button
    // since radio button values are of type String, we then do a quick
    // check to see if it's "true" and return a boolean true or false
    const bikeLapseSyncRadioSelection = ( function() {
        // get reference to all radios with name "rideType"
        // NOTE: this returns a NodeList object, not an Array
        const radios = document.getElementsByName('hasBikeLapseSync');

        // need to use a for loop because radios is a NodeList not an Array
        for (let i = 0; i < radios.length; i++) {

            // if the radio is checked, return its value
            if(radios[i].checked){
                return radios[i].value;
            }
        }

        return "none_checked";
    })() === "true" ? true : false;

    // get the youtube ID
    const youtubeVideoID = document.getElementById('youTubeVideoID').value;

    // if the youTube ID is set, use the chosen biklapseSync setting otherwise set to false
    const hasBikeLapseSync = (youtubeVideoID !== "") ? bikeLapseSyncRadioSelection : false;
 

    // create our rideInfo metadata with all user input data
    // we add ride stats when first importing a GPX with addGeoJSONPointFeaturesMetadataAndRideStats()
    const rideMetadata = {    
        "rideName": document.getElementById('rideName').value,
        "hasBikeLapseSync": hasBikeLapseSync,
        "youTubeVideoID": youtubeVideoID,
        "stravaURL": document.getElementById('stravaURL').value,
        "googleMapURL": document.getElementById('googleMapURL').value
    }

    const startLocationName = document.getElementById('startLocationName').value;
    const finishLocationName = document.getElementById('finishLocationName').value;

    return { 
                "rideMetadata": rideMetadata, 
                "startName": startLocationName,
                "finishName": finishLocationName
           };


}







// *********************************************************************************************************************
// THIS IS THE FUNCTION THAT GENERATES THE START, FINISH AND DETAILS POINT FEATURES 
//      FROM THE FIRST/LAST/MIDDLE POINTS OF THE ROUTE LINESTRING AND INFORMATION FROM USER INPUT
//      SO WE CAN ADD THEM TO THE GEOJSON AND THEY WILL APPEAR ON OUR MAP
// *********************************************************************************************************************
function createPointFeature(routeLineString, pointName, pointLocationName = 'Location Name'){

    // get the coordTimes and coordinates arrays from the ROUTE LineString
    const routeCoordTimes = routeLineString.properties.coordTimes;
    const routeCoordinates = routeLineString.geometry.coordinates;

    // do a cheeky little check to see if they are the same length and print to the console.log if they are not
    if(routeCoordTimes.length !== routeCoordinates.length){
        console.log("coordTimes and coordinates arrays are not of the same length");
        console.log("coordTimes Array Length: ", routeCoordTimes.length);
        console.log("coordinates Array Length: ", routeCoordinates.length);
    }

    // create placeholders for the information we want to show on the pin
    let pointCoords = [];
    let properties = {
        "name": pointName
    };


    // get the index into the coords array for each point
    const pointIndex =  (pointName === "START") ? 0 :
                        (pointName === "FINISH") ? routeCoordinates.length - 1 :
                        (pointName === "DETAILS") ? Math.round(routeCoordinates.length/2) :
                        "Point Name not recognized";



    // get the point coords and add the "meta" information to .properties for the "START/FINISH" points
    switch (pointName) {
        case "START":
        case "FINISH":
            pointCoords = routeCoordinates[pointIndex];

            properties["meta"] = {
                "locationName": pointLocationName,
                "time": routeCoordTimes[pointIndex],
                "elevation": {
                    "m": pointCoords[elevationIndex],
                    "ft": _toFeet(pointCoords[elevationIndex])
                }
            }
          break;
        case "DETAILS":    
            pointCoords = routeCoordinates[pointIndex];
          break;
        default:
            console.log("Point Name not recognized");
      }

    // create the point feature
    const pointFeature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": pointCoords
        },
        "properties": properties
    }

    return pointFeature;

}


// *********************************************************************************************************************
//      shows the geoJson in the text area
// *********************************************************************************************************************
function showGeoJSONInTextArea(geoJson){

    // if a GeoJson was passed in, use it, otherwise use the globally defined one
    // we don't need to do it this way anymore so it's commented out
    // let geoJsonToOutput = (geoJson !== undefined) ? geoJson : _geoJsonData;
    
    // stringify the GeoJson in order to print to the textarea
    geoJsonTextarea.value = JSON.stringify(geoJson, null, 4);

}



// ************************************************************************
// ADD RIDE TO MAP
//      This is the function that will add the ride to the map initially
//      or if the "save changes" button is pressed, it will update the ride
//      it will also re-set the elevation display for the ride although
//      that is likely not necessary, but will be good if in the future
//      we want to allow the ability to re-import GPX files
// ************************************************************************
function addRideToMap(){
  
    // if we're updating the map (only used in create-ride interface), 
    // then the geoJsonLayerGroup will be set to undefined
    // we should remove the geoJsonLayerGroup before re-creating it
    // if(operation === "update"){
    if(geoJsonLayerGroup !== undefined){
    //   clearElevationDisplay();
      geoJsonLayerGroup.remove();
    }
    
    // *****************************************************************
    //   CREATE (OR RE-CREATE) THE GEOJSONLAYERGROUP AND ADD TO THE MAP
    // *****************************************************************
    geoJsonLayerGroup = createGeoJsonLayerGroupForRide(_geoJsonData, _geoJsonData.metadata);

    // add it to the map
    geoJsonLayerGroup.addTo(map);
    
    
    // *************************************************************
    //     DISPLAY ALL OF THE UI AND INFO FOR THE RIDE
    // ************************************************************* 
    displaySelectedRide(_geoJsonData.metadata, geoJsonLayerGroup, allowHiddenVideoDisplayDiv = false);


    // *************************************************************
    //     SET FRAME OFFSET CALLBACK CHECK --> "youtube-logic.js"
    //          If this ride has bikelapse sync, we need to check to make
    //          sure the video length (number of frames) actually will
    //          sync with our geoJson data. But the YouTube API can only
    //          give us the length of the video after the play button is
    //          pressed for the first time. Hence this callback
    // *************************************************************
    if(_geoJsonData.metadata.hasBikeLapseSync){
        yt_setFameOffsetCheckCallback(checkIfVideoFrameCountAndLineStringLengthMatch);
        _printFrameOffsetInfo = true;
        yt_playYouTubeVideo();
    }
    else{
        yt_setFameOffsetCheckCallback(undefined);
    }

    // *************************************************************
    //     RECENTER THE MAP ON OUR RIDE
    // ************************************************************* 
    reCenterMap(geoJsonLayerGroup);
}



// *************************************************************
//     CALLBACK FOR FRAME OFFSET CALCULATION
//        In the case of a bikelapse, we need to check to
//        Make sure the video length is equal to our linestring
//        Video length in this case = (Video Duration in seconds * 15 fps)
//        Linestring length = geometry.coordinates.length
//                          = properties.coordtimes.length
// ************************************************************* 
function checkIfVideoFrameCountAndLineStringLengthMatch(videoFrameCount){

    // get a reference to our lineString
    const lineString = getFeatureFromGeoJson(_geoJsonData, "ROUTE", "LineString");

    // grab it's length
    const linestringLength = lineString.geometry.coordinates.length;
    
    // calculate the frame offset (difference in length of video in frames and our linestringLength)
    const frameOffset = linestringLength - videoFrameCount;

    // check to make sure the frameOffset is within the tolerance range and warn accordingly
    if(Math.abs(frameOffset) >= yt_getFrameOffsetTolerance() && !allowOffsetOutsideTolerance){
        alert(  `VIDEO DURATION AND LENGTH OF LINESTRING DO NOT MATCH\n\n` +

                `${videoFrameCount} -- Video length in frames\n` +
                `${linestringLength} -- Linestring coordinates array length\n` +
                `${frameOffset} -- Difference ("frameOffset")\n\n` +

                `In order for bikelapse to work, the video length (in frames) ` +
                `should be very close to the GeoJson linestring coords array length\n\n` +

                `Make sure you've selected the right video for the GPX file imported\n` +
                `Or select the "No" radio button in the Ride Info form\n` + 
                `Otherwise you'll continue to see this annoying popup sorry!!!\n`
             );
    }
    else{
        if(_printFrameOffsetInfo){

            const pithyRemark = (frameOffset === 0) ? "perfect match!" :
            (frameOffset > 0) ? "lost some frames in your video huh?" : 
            "that video is looking a touch too long :)";
            
            const frameOffsetInfo = {
                "videoFrameCount":videoFrameCount,
                "linestringLength": linestringLength,
                "frameOffset": frameOffset,
                "pithyRemark": pithyRemark
            }
            
            console.log("Frame Offset Info", frameOffsetInfo);

            _printFrameOffsetInfo = false;
        }
    }

    // save the frameoffset in our geoJson metadata
    _geoJsonData.metadata["frameOffset"] = frameOffset;   

    // send the frameoffset back to our youtube player for playback purposes with our tolerance respected or not
    yt_setFrameOffset(frameOffset, allowOffsetOutsideTolerance);

    // show this update in the GeoJSONTextArea
    showGeoJSONInTextArea(_geoJsonData);

}




/* ########### UI INTERACTION HANDLERS ##########################################################################################
    TEXT FIELD INTERACTION HANDLER, BUTTON CLICK HANDLERS, UI TEXT FIELD UPDATERS
        Save Changes button and "unsaved changes" text aleart show/hide
        download button handler for "GeoJSON" and 'GPX download buttons
################################################################################################################################# */

// this event fires if the user has typed new text in one the form fields
// or chosen a different radio button
// all it does is update the "Saved Changes" button and text label
// so the user knows they need to save changes before downloading their file
function handleFormChanges(event){

    // if we've imported data and are therefore displaying it in the map then carry out the event
    if(_geoJsonData !== undefined){

        if(event.type === "keyup" || (event.type === "change" && event.target.type === "radio") ){
            unsavedChanges(true);
            // document.getElementById('save-changes-button').disabled = false;
        }
    }
    else{
        // console.log("gpx import still enabled");
    }
}


// This function is called when someone pushes the "save changes" button 
// is the most involved function other than the initial gpx import and conversion function above
// it updates all of the metadata associated with each feature 
// that is able to be modifiedby the user text input fields 
function saveChangesButtonHandler(event){

    // check to make sure the GeoJson has been created first
    if(_geoJsonData !== undefined){
        // get user inputs from text fields returns ridemetadata and start/finish point names
        const metadataAndPointNames = getMetadataAndPointNamesFromUserInputFields();

        const rideMetadataKeysToReplace = Object.keys(metadataAndPointNames.rideMetadata);

        // only replace the ride metadata given to us from the user inputs
        rideMetadataKeysToReplace.forEach( (key, i) => {
            // if the key is "youTubeVideoID" and it's different than the one we currently have stored
            // or we don't have bikeLapseSync, then we should set "frameOffset" to undefined 
            // otherwise, leave it the same as it was
            if(key === "youTubeVideoID"){
                const savedVideoID = _geoJsonData.metadata[key];
                const newVideoID = metadataAndPointNames.rideMetadata[key];
                const hasBikeLapseSync = metadataAndPointNames.rideMetadata.hasBikeLapseSync;

                // if the video ID has changed, or we don't have bikeLapseSync, set "frameOffset" to undefined
                if(savedVideoID !== newVideoID || !hasBikeLapseSync){
                    _geoJsonData.metadata["frameOffset"] = undefined;
                    // console.log("video different nullifying frameOffset");
                }
                else{
                    // console.log("video same keeping frameOffset");
                }
            }

            // lastly, replace they value for that key with the new value
            _geoJsonData.metadata[key] = metadataAndPointNames.rideMetadata[key];
            
        });

        // loop through all the features in the GeoJson
        // replace the description for the features who's names are "START" and "FINISH" 
        _geoJsonData.features.forEach( (feature) => {

            let featureName = feature.properties.name;

            switch (featureName) {
                case "START":
                case "FINISH":
                    // if the feature's name is "START" use the user input from the Start Name box
                    // otherwise use the user input from the Finish Name box
                    const newLocationName = (featureName === "START") ? metadataAndPointNames.startName : metadataAndPointNames.finishName;

                    // replace the existing name with the new one
                    feature.properties.meta.locationName = newLocationName;

                    break;
            }
    
        });        

        // print GeoJson to textarea
        showGeoJSONInTextArea(_geoJsonData);
        
        addRideToMap();
        
        //******** update save button and clear helper text *********************************
        unsavedChanges(false);
    }
    else{
        alert('Please import a GPX file (or files) first')
        console.log("rides data is of type: ", typeof(_geoJsonData));
    }

    
}



// this simply toggles if the "Save Changes" button is enabled or disabled
// and either ads or removes the notification text next to the button that says "unsaved changes"
function unsavedChanges(unsavedChanges){

    document.getElementById('save-changes-button').disabled = !unsavedChanges;
    
    let notificationText = (unsavedChanges) ? 'unsaved changes' : '';

    document.getElementById('save-changes-button-notification-text').innerHTML = notificationText;    

}



// CALLED WHEN "GeoJSON" and "GPX" DOWNLOAD BUTTONS ARE CLICKED
// downloads the correct file according to which button was pressed
// the name of the file is generated from the date/name of the ride
function downloadButtonHandler(event){

    // check to make sure the GeoJson has been created first
    // if it hasn't, send an alert that the user needs to
    // import a GPX file before we will generate a GeoJSON or GPX to save
    if(_geoJsonData !== undefined){

        // get the routeLineString from the rideData 
        let routeLineString = getROUTELineStringFromGeoJson(_geoJsonData);

                                                                    
        // pull the ISO date time so we can use for the file name later
        let rideTime = routeLineString.properties.time;
        let rideName = _geoJsonData.metadata.rideName;
        let fileExtension = "";
        let fileContents = "";

        switch (event.target.id) {
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

        // Generate download of file with fileContents as content
        download(filename, fileContents);
    }
    else{
        alert('Please import a GPX file (or files) first\nOnce imported, the GeoJSON will be generated\nIf multiple GPX files were imported they will be combined into one file');
        console.log("rides data is of type: ", typeof(_geoJsonData));
    }
    
}

// FILE DOWNLOAD HACK
// a hacky way that the internet taught me to be able to download text files
// called after the file the user wants to download has been generated
// it basically creates a hidden HTML <a href> element who's href url
// points to the contents of the text of the file, which we have encoded into the href url
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}