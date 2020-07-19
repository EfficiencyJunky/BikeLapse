let gpxImportButtonFileNameLabel = document.getElementById('file-name-disp-text');
let outputTextarea = document.getElementById('output-textarea');


// **************************************************************************
//     CONVERT THE GPX FILE TEXT OBJECT TO GEOJSON USING "toGeoJSON" LIBRARY
// **************************************************************************
function convertFileToGeoJSON(gpxXMLFileText, fileName) {
    
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br>loading...";

    // create a DOMParser to parse the GPX file in XML format
    let dom = new DOMParser().parseFromString(gpxXMLFileText, "application/xml");

    let error = dom.querySelector("parsererror");
    if (error) throw new Error(error.innerText);

    // convert to geoJSON with "toGeoJSON" library
    let geoJson = toGeoJSON.gpx(dom);

    // console.log("writing text");

    // update the label below the GPX file import button
    gpxImportButtonFileNameLabel.innerHTML = gpxImportButtonFileNameLabel.innerHTML + "<br><b>File Imported:</b><br>" + fileName;
    
    // write output to textarea      
    outputTextarea.value = JSON.stringify(geoJson, null, 4);

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
d3.select("#filein").on("change", handleFileSelection);
// document.getElementById('filein').addEventListener("change", handleFileSelection);
// document.getElementById('filein').onchange = handleFileSelection;












