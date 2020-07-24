// ****************************************************************************
// getDistance and _toRadian functions were originally sourced
// from this repository: https://github.com/MovingGauteng/GeoJSON-Tools
// then modified to work for my own purposes
// ****************************************************************************
/**
 * converts degrees to radians
 *
 * @param {Number} coordinates in degrees
 * @returns {Number} coordinates in radians
 */
let _toRadian = function (degree) {
    return degree * Math.PI / 180;
  };


/**
 *
 * @param {Array} array array of coordinates
 * @param {Number} decimals number of decimals to return
 * @param {boolean} latLonReversed if the coordinate pairs are [lon, lat] instead of [lat, lon] set the third argument to 'true' otherwise it can be omitted or set to 'false'
 * @returns {Object} Object who's keys are "km" and "mi" with values being the distance in those units
 */
let getDistance = function (array, decimals, latLonReversed = false) {

    // make the latIndex 0 if parameter "latLonReversed" is false or 1 if true
    // then make the lonIndex 0 if latIndex is 1 or vice versa
    let latIndex = (!latLonReversed) ? 0 : 1;
    let lonIndex = 1 - latIndex;

    // if decimals isn't defined, default to 3 decimals places
    decimals = decimals || 3;

    // var earthRadius = 6378.137, // km
    let earthRadius = 6371.137, // km
      distance = 0,
      len = array.length,
      i,
      x1,
      x2,
      lat1,
      lat2,
      lon1,
      lon2,
      dLat,
      dLon,
      a,
      c,
      d;
    for (i = 0; (i + 1) < len; i++) {
      x1 = array[i];
      x2 = array[i + 1];
  
      lat1 = parseFloat(x1[latIndex]);
      lat2 = parseFloat(x2[latIndex]);
      lon1 = parseFloat(x1[lonIndex]);
      lon2 = parseFloat(x2[lonIndex]);
  
      dLat = _toRadian(lat2 - lat1);
      dLon = _toRadian(lon2 - lon1);
      lat1 = _toRadian(lat1);
      lat2 = _toRadian(lat2);
  
      a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      d = earthRadius * c;
      distance += d;
    }
    distance = Math.round(distance * Math.pow(10, decimals)) / Math.pow(10, decimals);

    let distWithBothUnits = {
      "km": Number(distance.toFixed(2)),
      "mi": Number((distance * 0.62137119).toFixed(2))
    }

    return distWithBothUnits;
  };



// ******************************************************************************
// ANOTHER FUNCTION TO CALCULATE THE DISTANCE (IN METERS) BETWEEN COORDINATES
// THIS ONE SIMPLY TAKES TWO COORDINATES AND CALCULATES THEIR DISTANCE (METERS)
// Main functionality of this function was taken 
// from this website: https://www.movable-type.co.uk/scripts/latlong.html
// ******************************************************************************
/**
 *
 * @param {Array} coord1 1st pair of coordinates [lat, lon]
 * @param {Array} coord2 2nd pair of coordinates [lat, lon]
 * @param {boolean} latLonReversed if the coordinate pairs are [lon, lat] instead of [lat, lon] this should be set to true
 * @returns {Number} distance in meters
 */
function calcDistance(coord1, coord2, latLonReversed = false){

  // make the latIndex 0 if parameter "latLonReversed" is false or 1 if true
  // then make the lonIndex 0 if latIndex is 1 or vice versa
  const latIndex = (!latLonReversed) ? 0 : 1; 
  const lonIndex = 1 - latIndex; 
  
  const lat1 = coord1[latIndex];
  const lat2 = coord2[latIndex];
  const lon1 = coord1[lonIndex];
  const lon2 = coord2[lonIndex];

  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres

  return d;
}


// ****************************************************************
//     MY GEOJSON TOOLS
// ****************************************************************
function getLatLonFromLineStringCoordsArray(lineStringCoordsArray){

  const reversedLineStringCoordsArray = lineStringCoordsArray.map((point) => {
      return point.slice(0, 2).reverse();
  });

  return reversedLineStringCoordsArray;
}



// Saturday, November 16, 2019 1:32 PM PST
// Distance: 22.1 miles
// Duration: 1 hours, 47 minutes, and 12 seconds
// Average Speed: 12.4 mph
// Minimum Elevation: 5 feet
// Maximum Elevation: 340 feet
// Total climb: 1050 feet
// Total descent: 832 feet


/**
 * calculates the total duration from begining to end of a coordTimesArray
 * @param {Array} coordTimesArray Array of times from a LineString's properties.coordTimes
 * @returns {Object} the duration of the ride in various formats put into an object
 * {
 *  string: a nicely formatted human readable string
 *  hours: number of hours in float form
 *  duration: the complete moment.duration() object
 * }
 */
function getDuration(coordTimesArray){

  // create moment objects for the first and last elements of the coordTimesArray
  const start = moment(coordTimesArray[0]);
  const finish = moment(coordTimesArray[coordTimesArray.length - 1]);

  // use moment functions to calculate the duration of time between them
  let rideDuration = moment.duration(finish.diff(start));

  // use the minutes and seconds to create a string that is formatted as "[minutes] minutes, and [seconds] seconds"
  let durationString = rideDuration.minutes() + " minutes, and "  + rideDuration.seconds() + " seconds";

  // if the duration lasted more than 1 hour, pre-pend the string with "[hours] hours, "
  if(rideDuration.hours() > 0){
    durationString = rideDuration.hours() + " hours, " + durationString;
  }

  let durationInfo = {
    "string": durationString,
    "hours": Number(rideDuration.asHours().toFixed(2)),
    "duration": rideDuration
  }

  // return the formatted string
  return durationInfo;

}

/**
 * calculates the average speed in mph and kph from a duration and distance object
 * @param {ArrObjectay} duration object with various information about the duration of the ride
 * @param {Object} distance object with distance of the ride in mi and km 
 * @returns {Object} object with mph and kph
 * {
 *  mph: mph in float format
 *  kph: kph in float format
 * }
 */
function getAvgSpeed(duration, distance){

  // console.log("duration type: ", typeof(duration.hours));
  return {
            "mph": (distance.mi / duration.hours).toFixed(2),
            "kph": (distance.km / duration.hours).toFixed(2)
          }
}


/**
 * calculates various stats around elevation
 * @param {ArrObjectay} duration object with various information about the duration of the ride
 * @returns {Object} object with max, min, total gain, total descent
 * {
 *  max_ft: 
 *  min_ft: 
 *  gain_ft: 
 *  descent_ft:
 *  max_m: 
 *  min_m: 
 *  gain_m: 
 *  descent_m: 
 * }
 */
function getElevationStats(coordsArray){

  let elevationIndex = 2;

  let min_m = coordsArray[0][elevationIndex],
      max_m = coordsArray[0][elevationIndex], 
      gain_m = 0, 
      descent_m = 0
      prevElevation = coordsArray[0][elevationIndex],
      deltaThreshold = 0.1;

  coordsArray.map((coord) => {
    // get the elevation of the current coordinate
    let elevation = coord[elevationIndex];

    // subtract from previous elevation to get the delta between current elevation and previous elevation
    let delta = Number((elevation - prevElevation).toFixed(2));

    // if the absolute value of the delta is really big, then something likely went wrong with the data
    // or we stopped and started somewhere else
    // so we won't use this elevation point
    if(Math.abs(delta) < 20){
      // compare to previoius max/min and get new max/min
      min_m = Math.min(min_m, elevation);
      max_m = Math.max(max_m, elevation);

      // if the delta is positive (and greater than our threshold) then add to our total gain
      if(delta > deltaThreshold){
        gain_m = gain_m + delta;
      }
      // else if the delta is negative (and greater than our threshold) then add to our total descent
      else if(delta < -deltaThreshold){
        descent_m = descent_m + delta;
      }
    }

    prevElevation = elevation;

  });

  let feetPerMeter = 3.28084;

  // console.log(max_m * feetPerMeter);
  // console.log(min_m * feetPerMeter);
  // console.log(gain_m * feetPerMeter);
  // console.log(descent_m * feetPerMeter);

  let elevationInfo = {
    "min_m": Math.round(min_m),
    "max_m": Math.round(max_m),
    "gain_m": Math.round(gain_m),
    "descent_m": Math.round(Math.abs(descent_m)),
    "min_ft": Math.round(min_m * feetPerMeter),
    "max_ft": Math.round(max_m * feetPerMeter),
    "gain_ft": Math.round(gain_m * feetPerMeter),
    "descent_ft": Math.round(Math.abs(descent_m * feetPerMeter))
  }

  return elevationInfo;

}











