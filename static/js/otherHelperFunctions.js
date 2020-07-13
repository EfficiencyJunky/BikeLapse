// **************** NON MAPPING HELPER FUNCTIONS ******************
// **************** NON MAPPING HELPER FUNCTIONS ******************
// **************** NON MAPPING HELPER FUNCTIONS ******************


// **************** RETURNS A ZERO PADDED STRING BASED ON THE GIVEN NUMBER "n" AND "width" TOTAL NUMBERS ******************
// Example Usage
// pad(10, 4);      // 0010
// pad(9, 4);       // 0009
// pad(10, 4, '-'); // --10
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
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