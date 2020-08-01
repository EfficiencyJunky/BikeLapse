// comparison function for sorting XML File Parser Array
function compare(a, b) {

  let startTimeA = a.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;
  let startTimeB = b.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;

  // a is less than b by some ordering criterion
  if (moment(startTimeA).isBefore(startTimeB)) {
    return -1;
  }
  else {
    return 1;
  }

  // here's the way to do the same thing if we need to have a separate
  // return function when they are equal. this is really just for future reference
  // if (moment(startTimeA).isBefore(startTimeB)) {
  //   return -1;
  // }  
  // // a is greater than b by the ordering criterion
  // if (!moment(startTime1).isBefore(startTime2)) {
  //   return 1;
  // }
  // // a must be equal to b
  // return 0;
}


// takes an array of parsed XML (GPX) files in text format, sorts them by start time, and then combines them together
function combineXMLFiles(filesTextArray){
  
  let xmlDocsArray = filesTextArray.map((fileText) => {
    // let parser = new DOMParser();
    // return parser.parseFromString(fileText,"application/xml");

    // create a DOMParser to parse the GPX file in XML format
    let domParser = new DOMParser().parseFromString(fileText,"application/xml");

    let error = domParser.querySelector("parsererror");
    if (error) throw new Error(error.innerText);

    return domParser;
  });

  // THIS IS VERY IMPORTANT!!!
  // We need to sort the array by timestamp using the "compare" function defined above
  // if we don't do this, then the order of the ride will get all jumbled
  xmlDocsArray.sort(compare);  
  
  // grab the first xmlDocDom in the array and use that as our base file that we will add on to
  let xmlDocDom = xmlDocsArray[0];

  // grab a reference to this xmlDocDom's first (and should be only) "trkseg" node
  let trkseg = xmlDocDom.getElementsByTagName("trkseg")[0];
  
  //loop to do the work
  for(let i=1; i < xmlDocsArray.length; i++){
    
    let xmlDocToAdd = xmlDocsArray[i];

    let trkpts = xmlDocToAdd.getElementsByTagName("trkpt");

    for (let j=0; j < trkpts.length; j++) {

      // add a newline and the appropriate indent (not necessary for XML specification but keeps the output file looking pretty)
      trkseg.appendChild(document.createTextNode("\n			"));

      // use the cloneNode() function to clone the node and set the "deep" parameter to true
      // setting deep to true means it will do a full clone of the node AND its descendants (child nodes)
      let trkpt = trkpts[j].cloneNode(deep = true);

      // append the cloned node to the trkseg node (array of trkpt nodes)
      trkseg.appendChild(trkpt);
    }
   
  }
  
  // add a newline and the appropriate indent for the closing </trkseg> tag (not necessary for XML specification but keeps the output file looking pretty)
  trkseg.appendChild(document.createTextNode("\n		"));

  // let mySerializer = new XMLSerializer();
  
  // let xmlString = mySerializer.serializeToString(xmlDocDom);
  
  // return xmlString;

  return xmlDocDom;


}