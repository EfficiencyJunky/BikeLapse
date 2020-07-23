/**
 * converts degrees to radians
 *
 * @param {Number} coordinates in degrees
 * @returns {Number} coordinates in radians
 */
var _toRadian = function (degree) {
    return degree * Math.PI / 180;
  };


/**
 *
 * @param {Array} array array of coordinates
 * @param {Number} decimals number of decimals to return
 * @returns {Number}
 */
var getDistance = function (array, decimals) {

    decimals = decimals || 3;
    // var earthRadius = 6378.137, // km
    var earthRadius = 6371.137, // km
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
  
      lat1 = parseFloat(x1[0]);
      lat2 = parseFloat(x2[0]);
      lon1 = parseFloat(x1[1]);
      lon2 = parseFloat(x2[1]);
  
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
    return distance;
  };