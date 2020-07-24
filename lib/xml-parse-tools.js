// comparison function for sorting XML File Parser Array
function compare(a, b) {

  let startTimeA = a.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;
  let startTimeB = b.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;

  // a is less than b by some ordering criterion
  if (moment(startTimeA).isBefore(startTimeB)) {
    return -1;
  }
  else{
    return 1;
  }
  // // a is greater than b by the ordering criterion
  // if (!moment(startTime1).isBefore(startTime2)) {
  //   return 1;
  // }
  // // a must be equal to b
  // return 0;
}






// takes an array of parsed XML (GPX) files in text format, sorts them by start time, and then combines them together
function combineXMLFiles(filesTextArray){
  
  // let parser1 = new DOMParser();
  // let xmlDoc1 = parser1.parseFromString(filesTextArray[0],"application/xml");

  // let parser2 = new DOMParser();
  // let xmlDoc2 = parser2.parseFromString(filesTextArray[1],"application/xml");


  // console.log("filesTextArray type: ", typeof(filesTextArray));
  // console.log("filesTextArray length: ", filesTextArray.length);
  // console.log("filesTextArray: ", filesTextArray);

  let xmlDocsArray = filesTextArray.map((fileText) => {
    let parser = new DOMParser();
    return parser.parseFromString(fileText,"application/xml");
  });

  xmlDocsArray.sort(compare);

  // ****************************************   TESTING  *****************************************
  // let startTime1 = xmlDoc1.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;
  // let startTime2 = xmlDoc2.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;

  // if(moment(startTime1).isBefore(startTime2)){
  //   console.log("Start1 is before Start2");
  // }
  // else{
  //   console.log("Start1 is after Start2");
  // }

  // let startTimeA = xmlDocsArray[0].getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;
  // let startTimeB = xmlDocsArray[1].getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;

  // if(moment(startTimeA).isBefore(startTimeB)){
  //   console.log("StartA is before StartB");
  // }
  // else{
  //   console.log("StartA is after StartB");
  // }
  // ****************************************   TESTING  *****************************************

  // console.log(startTime1);
  // console.log(startTime2);

  // let xmlDoc = xmlDoc1;
  // let xmlDocB = xmlDoc2;
  
  
  let xmlDoc = xmlDocsArray[0];

  for(let i=1; i < xmlDocsArray.length; i++){
    
    let trkseg = xmlDoc.getElementsByTagName("trkseg")[0];
  
    let xmlDocToAdd = xmlDocsArray[i];
    let trkpts = xmlDocToAdd.getElementsByTagName("trkpt");
  
    for (let j=0; j < trkpts.length; j++) {
      trkseg.appendChild(trkpts[j]);
    }
  }

  // let element = xmlDoc.getElementsByTagName("trkseg")[0].childNodes[0].nodeValue;
  // let rootNode = xmlDoc.getElementsByTagName("trk")[0];

  let mySerializer = new XMLSerializer();
  
  let xmlString = mySerializer.serializeToString(xmlDoc);
  
  return xmlString;


}






function combineTwoXMLFiles(file1Text, file2Text){
  
  let parser1 = new DOMParser();
  let xmlDoc1 = parser1.parseFromString(file1Text,"application/xml");

  let parser2 = new DOMParser();
  let xmlDoc2 = parser2.parseFromString(file2Text,"application/xml");


  let startTime1 = xmlDoc1.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;
  let startTime2 = xmlDoc2.getElementsByTagName("trkpt")[0].getElementsByTagName("time")[0].innerHTML;


  if(moment(startTime1).isBefore(startTime2)){
    console.log("Start1 is before Start2");
  }

  if(!moment(startTime2).isBefore(startTime1)){
    console.log("Start2 is NOT before Start1");
  }


  // console.log(startTime1);
  // console.log(startTime2);


  // let trk = xmlDoc.getElementsByTagName("trk")[0];

  let trkseg = xmlDoc1.getElementsByTagName("trkseg")[0];

  let trkpts = xmlDoc2.getElementsByTagName("trkpt");

  for (var i = 0; i < trkpts.length; i++) {
    trkseg.appendChild(trkpts[i]);
  }


  // let element = xmlDoc.getElementsByTagName("trkseg")[0].childNodes[0].nodeValue;
  // let rootNode = xmlDoc.getElementsByTagName("trk")[0];

  var mySerializer = new XMLSerializer();
  
  let xmlString = mySerializer.serializeToString(xmlDoc1);
  
  return xmlString;


  // xmlDoc = xmlhttp.responseXML;
  // txt = "";
  // x = xmlDoc.getElementsByTagName("*");
  // for (i = 0; i < x.length; i++) {
  //     txt += x[i].childNodes[0].nodeValue + "<br>";
  // }
  // document.getElementById("demo").innerHTML = txt;







  // let objectHTMLCollection = xmlDoc.getElementsByTagName("trkseg");

  // let string = [].map.call( objectHTMLCollection, function(node){
  //     return node.textContent || node.innerText || "";
  // }).join("");

  // console.log(objectHTMLCollection);

  // return txt;
  



  // var xml1 = loadXMLDoc(file1.name);
  // var xml2 = loadXMLDoc(file2.name);
  // //You can use any element here...
  // //the chosen element will be the document element of the new XML document
  // var newXML = document.getElementById('combiner');
  // //And actually append the other XML documents to this one
  // newXML.appendChild(document.importNode(xml1.documentElement));
  // newXML.appendChild(document.importNode(xml2.documentElement));
  
  // outputTextarea.value = newXML;

  //newXML now contains the whole contents of both XML documents

}

