// GLOBAL CONVERSION PERAMETERS
const feetPerMeter = 3.28084;
const milesPerKilometer = 0.621371;


// ****************************************************************************
// _toRadian and getDistance functions were originally sourced
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
      "km": distance,
      "mi": _toMiles(distance)
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





// #############################################################################
// *********  GEOJSON TOOLS I CREATED ************************
// #############################################################################
/**
 * calculates the total duration we were actually in motion throughout the coordTimesArray
 * calculates the total duration from begining to end of a coordTimesArray
 * @param {Array} coordTimesArray Array of times from a LineString's properties.coordTimes
 * @param {string} timeType either 'moving' or 'elapsed' - designates which type of time duration we want 
 *                          'moving' adds up all the durations between each consecutive point in the coordTime array
 *                          that are greater than the value stored in "maxAllowableDurationDiffSeconds"
 *                          'elapsed' only calculates the duration between the first and last point in the coordTime array
 * @returns {Object} the duration of the ride in various formats put into an object
 * {
 *  string: a nicely formatted human readable string
 *  hours: number of hours in float form
 *  duration: the complete moment.duration() object
 * }
 */
function getRideDuration(coordTimesArray, timeType){

  let rideDuration;
  // console.log(rideDuration);
  switch(timeType){
    case 'elapsed':
      // create moment objects for the first and last elements of the coordTimesArray
      const start = moment(coordTimesArray[0]);
      const finish = moment(coordTimesArray[coordTimesArray.length - 1]);

      // use moment functions to calculate the duration of time between them
      rideDuration = moment.duration(finish.diff(start));
      
      break;

    case 'moving':

      // the maxAllowableDurationDiff is the maximum amount of time we can allow to pass between points
      // to consider adding it to the total duration of our "moving time" calculation
      // basically we are assuming that the rider wasn't really moving if the time
      // between the two moments was more than this amount of time
      const maxAllowableDurationDiffSeconds = 45;
      
      //create a moment object for the first time in the array
      let prevMoment = moment(coordTimesArray[0]);
      let rideDurationMilliseconds = 0;

      coordTimesArray.map((currentTime, i) => {
        
        // create a moment object for the current time in the array
        const currentMoment = moment(currentTime);

        // use moment function to calculate the duration of time between the previous and current moment
        const durationDiff = moment.duration(currentMoment.diff(prevMoment));

        if(durationDiff.asSeconds() < maxAllowableDurationDiffSeconds){          
          rideDurationMilliseconds = rideDurationMilliseconds + durationDiff.asMilliseconds();

          // console.log(durationDiff);
        }
        else{
          // console.log("long diff loc", i ,":", pad(durationDiff.minutes(),2) + ":" + pad(durationDiff.seconds(),2), ":");
        }

        prevMoment = moment(currentTime);
      });
      
      rideDuration = moment.duration(rideDurationMilliseconds);
      // console.log("ride duration: ", rideDuration);

      break;

    default:
      alert("timeType not specified");
      return undefined;
  }


  // use the minutes and seconds to create a string that is formatted as "[minutes] minutes, and [seconds] seconds"
  // let durationString = rideDuration.minutes() + " minutes, and "  + rideDuration.seconds() + " seconds";

  // // if the duration lasted more than 1 hour, pre-pend the string with "[hours] hours, "
  // if(rideDuration.hours() > 0){
  //   durationString = rideDuration.hours() + " hours, " + durationString;
  // }

  // let durationInfo = {
  //   "string": durationString,
  //   "hours": Number(rideDuration.asHours().toFixed(6)),
  //   "milliseconds": rideDuration.asMilliseconds(),
  //   "duration": rideDuration // moment duration object
  // }

  // return the formatted string
  // return durationInfo;
  return rideDuration;

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

  let decimals_mi = countDecimals(distance.mi);
  let decimals_km = countDecimals(distance.km);

  return {
            "mph": Number((distance.mi / duration.asHours()).toFixed(decimals_mi)),
            "kph": Number((distance.km / duration.asHours()).toFixed(decimals_km))
          }
}


/**
 * calculates various stats related to elevation
 * @param {ArrObjectay} coordsArray Array of coordinates from a LineString's geometry.coordinates
 * @returns {Object} object with max, min, total gain, total descent in meters (_m) and feet (_ft)
 * {
 *  max_m: 
 *  min_m: 
 *  gain_m: 
 *  descent_m: 
 *  max_ft: 
 *  min_ft: 
 *  gain_ft: 
 *  descent_ft:
 * }
 */
function getElevationStats(coordsArray){

  // maxAllowedGain, deltaThreshold, and alpha are used to smooth
  // the noisy elevation data in the calculations below
  // and get rid of poential anomalies (like if elevation drops below 0 suddenly)
  const maxAllowedElevationGain = 2.0,
        minElevationGainThreshold = 0.12,
        alpha = 0.85;
        // feetPerMeter = 3.28084; // defined at top of file in global parameters
        

  // the elevation is in the 3rd position at each point in the coordsArray
  // because each coordinate in a GeoJSON is a 3 point array --> [lon, lat, ele]
  const elevationIndex = 2;

  let prevElevation = coordsArray[0][elevationIndex],
      min_m = prevElevation,
      max_m = prevElevation, 
      gain_m = 0, 
      descent_m = 0;
      
  // the main function to calculate the total elevation gain and descent in meters
  coordsArray.map((coord) => {
    // get the elevation of the current coordinate
    // let elevation = coord[elevationIndex];
    let elevation = coord[elevationIndex] * (1 - alpha) + prevElevation * alpha;

    // subtract from previous elevation to get the delta between current elevation and previous elevation
    let delta = Number((elevation - prevElevation).toFixed(2));
    // let delta = elevation - prevElevation;

    // if the absolute value of the delta is really big, then something likely went wrong with the data
    // or we stopped and started somewhere else
    // so we won't use this elevation point
    // maxAllowedElevationGain is the maximum possible number of meters we will allow to be added between two points
    if(Math.abs(delta) < maxAllowedElevationGain){
      // compare to previoius max/min and get new max/min
      min_m = Math.min(min_m, elevation);
      max_m = Math.max(max_m, elevation);

      // if the delta is positive (and greater than our threshold) then add to our total gain
      if(delta > minElevationGainThreshold){
        gain_m = gain_m + delta;
      }
      // else if the delta is negative (and greater than our threshold) then add to our total descent
      else if(delta < -minElevationGainThreshold){
        descent_m = descent_m + delta;
      }
    }
    else{
      // console.log("skipping elevation delta: ", delta);
      // console.log("coords: ", coord);
    }
    
    prevElevation = elevation;

  });

// ABRACADABRA - THIS IS WHERE WE NEED TO STOP ROUNDING
  let elevationStats = {
    "min": {
      "m": Math.round(min_m),
      "ft": _toFeet(min_m, 0)
    },
    "max": {
      "m": Math.round(max_m),
      "ft": _toFeet(max_m, 0)
    },
    "gain": {
      "m": Math.round(gain_m),
      "ft": _toFeet(gain_m, 0)
    },
    "descent": {
      "m": Math.abs( Math.round(descent_m) ),
      "ft": Math.abs( _toFeet(descent_m, 0) )
    }
  }

  // let elevationStats = {
  //   "min_m": Math.round(min_m),
  //   "max_m": Math.round(max_m),
  //   "gain_m": Math.round(gain_m),
  //   "descent_m": Math.abs( Math.round(descent_m) ),
  //   "min_ft": _toFeet(min_m, 0),
  //   "max_ft": _toFeet(max_m, 0),
  //   "gain_ft": _toFeet(gain_m, 0),
  //   "descent_ft": Math.abs( _toFeet(descent_m, 0) )
  // }

  // let elevationStats = {
  //   "min_m": min_m,
  //   "max_m": max_m,
  //   "gain_m": gain_m,
  //   "descent_m": Math.abs( descent_m ),
  //   "min_ft": _toFeet(min_m),
  //   "max_ft": _toFeet(max_m),
  //   "gain_ft": _toFeet(gain_m),
  //   "descent_ft": Math.abs( _toFeet(descent_m) )
  // }

  
  return elevationStats;

}



// #############################################################################
// *********  CUMULATIVE STATS ARRAYS GENERATION ****************
// #############################################################################
// this is how we calculat our in-ride stats display where we show the cumulative stats as the user plays the video
// we can get the Distance and Elevation from our Elevation Control class
// but we still need to get the Elapsed Time and Speed for each frameIndex

function getCumulativeStatsArrayFromLineString(lineString, timeType){

  // ****************************************************************************
  //  INITIALIZE CONSTANTS
  // ****************************************************************************
  const times = lineString.properties.coordTimes;
  const coords = lineString.geometry.coordinates;

  // the maxAllowableDurationDiff is the maximum amount of time we can allow to pass between points
  // to consider adding it to the total duration of our "moving time" calculation
  // basically we are assuming that the rider wasn't really moving if the time
  // between the two moments was more than this amount of time
  const maxAllowableDurationDiffSeconds = 45;
  const alphaSlow = 0.9;
  const alphaFast = 0.4;
  let alpha = alphaSlow;

  // ****************************************************************************
  //  INITIALIZE MUTABLE VARIABLES TO USE IN THE LOOP
  // ****************************************************************************
  let cumStatsArray = [
    {
      "distance": 0,
      "duration": moment.duration(0),
      "speed": 0
    }
  ]

  // initialize prevMoment as a moment of the first index in the time array
  let prevMoment = moment(times[0]);


  // ****************************************************************************
  //  ITTERATE OVER THE COORDS AND TIMES ARRAYS AND PERFORM CALCULATIONS
  // ****************************************************************************
  for (let i = 1; i < coords.length; i++) {

    // ***********************************
    //  CALCULATE THE DISTANCE TRAVELED
    // ***********************************
    
    // calculate the delta between the previous coordinate and the current coordinate
    // the distance will be in meters
    const distanceDelta = calcDistance(coords[i-1], coords[i], latLonReversed = true);
    
    // add the delta to the distance from our last iteration
    const cumDistance = cumStatsArray[i-1].distance + distanceDelta;
    

    // ***********************************
    //  CALCULATE THE MOVING DURATION 
    // ***********************************

    // create a moment object for the current time in the array
    const currentMoment = moment(times[i]);

    // use moment function to calculate the duration of time between the previous and current moment
    const durationDiff = moment.duration(currentMoment.diff(prevMoment));

    // console.log(getFormattedDurationStringFromISO(durationDiff));

    // const durationDiffClone = durationDiff.clone();
    // if the durration is an acceptable durration
    const cumDuration = (durationDiff.asSeconds() < maxAllowableDurationDiffSeconds) ?
                          // add it to the previous durration and save as current durration
                          // we have to clone it first though because these guys are mutating!!
                          // moment.duration().add() Mutates the original duration by adding time.
                          cumStatsArray[i-1].duration.clone().add(durationDiff) :
                          // otherwise just re-use the previous durration
                          cumStatsArray[i-1].duration;

    prevMoment = currentMoment;    

    
    // ****************************************************************************
    //  CALCULATE THE INSTANTANEOUS SPEED
    // ****************************************************************************

    // if distanceDelta == 0 then speed: 0
    // if durationDiff == 0 then speed: Infinity
    // if BOTH == 0 then speed: NaN
    // let currentSpeed = distanceDelta / durationDiff.asHours() / 1000;

    // if(!isFinite(currentSpeed)){
    //   console.log(currentSpeed);
    //   currentSpeed = 0;
    // }

    // if we haven't moved in space AND time then maybe the pictures took too fast
    // or there was a glitch of some sort
    if(distanceDelta === 0 && durationDiff.asHours() === 0.0){
      currentSpeed = cumStatsArray[i-1].speed;
      alpha = alphaSlow;
    }
    // if we haven't moved in space BUT we have moved in time
    // then chances are we are stopped
    else if(distanceDelta === 0){
      currentSpeed = 0;
      alpha = alphaFast;
    }
    // if we have moved in space BUT we have NOT moved in time
    // then chances are we are moving very fast
    else if(durationDiff.asHours() === 0.0){
      currentSpeed = cumStatsArray[i-1].speed;
      alpha = alphaSlow;
    }
    // otherwise just do the normal calculation and use the normal alpha
    else{
      currentSpeed = distanceDelta / durationDiff.asHours() / 1000;
      alpha = alphaSlow;
    }

    const speed = currentSpeed * (1 - alpha) + cumStatsArray[i-1].speed * alpha;


    // ****************************************************************************
    //  LOAD VALUES INTO "cumStatsArray"
    // ****************************************************************************    
    cumStatsArray.push(
      {
        "distance": cumDistance,
        "duration": cumDuration,
        "speed": speed
      }
    );

  }

  return cumStatsArray;

}









// #############################################################################
// *********  HELPER FUNCTIONS ****************
// #############################################################################
/**
 * converts meters to feet
 *
 * @param {Number} meters distance in meters
 * @param {Number} decimals number of decimals to round to. Defaults to 0 if none passed.
 * @returns {Number} distance in feet
 */
let _toFeet = function (meters, decimals) {

  // if decimals isn't defined, default to the same number of decimals places as the number that was passed in
  decimals = (decimals !== undefined) ? decimals : countDecimals(meters);

  return Number( (meters * feetPerMeter).toFixed(decimals) );
};


/**
 * converts kilometers to miles
 *
 * @param {Number} kilometers distance in meters
 * @param {Number} decimals number of decimals to round to. Defaults to 0 if none passed.
 * @returns {Number} distance in miles
 */
let _toMiles = function (kilometers, decimals) {

  // if decimals isn't defined, default to the same number of decimals places as the number that was passed in
  decimals = (decimals !== undefined) ? decimals : countDecimals(kilometers);

  return Number( (kilometers * milesPerKilometer).toFixed(decimals) );
};

/**
 * counts the number of decimals of the given number
 *
 * @param {Number} value the number who's decimals we want to count
 * @returns {Number} returns the number of decimals
 */
let countDecimals = function (value) {
  if(Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0; 
}


