// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************

// **************** FUNCTIONS TO GET COLORS FOR CIRCLES BASED ON SHAME SCORE AND LEGEND ******************
function getColorNormal(d) {
  return d >= 5.0  ? '#FF0000' :
         d >= 4.0  ? '#FFCC00' :
         d >= 3.0   ? '#ccff00' :
         d >= 2.0   ? '#66ff00' :
         d >= 1.0   ? '#00FF00' :
                    '#00FF00';
}

function getColorSignificant(d) {
  return '#000000';
}



// **************** GET THE CURRENT TIME AND IF IT'S NIGHT OR NOT ******************
function getCurrentTime(){
  let todaysDate = new Date();

  let HH = String(todaysDate.getHours()).padStart(2, '0');
  let MM = String(todaysDate.getMinutes()).padStart(2, '0');
  
  let time = HH + ':' + MM;

  return time;
}

// **************** GET THE CURRENT TIME AND IF IT'S NIGHT OR NOT ******************
function getIsNight(){
  let todaysDate = new Date();

  let HH = String(todaysDate.getHours()).padStart(2, '0');

  // if the current hour is between 8pm and 6am, set isNight to true
  let isNight = (HH <= 6 || HH >= 20);

  return isNight;
}


// **************** GET THE DATE 7 DAYS AGO ******************
function getDateOneWeekAgo(){
  let todaysDate = new Date();
  let dd = String(todaysDate.getDate()).padStart(2, '0');
  let mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = todaysDate.getFullYear();
  
  let today = yyyy + '-' + mm + '-' + dd;
  // console.log("date:", today);
  
  let sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(todaysDate.getDate() - 7);
  let dd2 = String(sevenDaysAgoDate.getDate()).padStart(2, '0');
  let mm2 = String(sevenDaysAgoDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy2 = sevenDaysAgoDate.getFullYear();
  
  let sevenDaysAgoString = yyyy2 + '-' + mm2 + '-' + dd2;
  
  console.log("date 7 days:", sevenDaysAgoString);

  return sevenDaysAgoString;
}