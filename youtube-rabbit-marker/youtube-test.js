// TEST BUTTONS & HANDLERS
let logButt = document.getElementById('logButton')
let swapButt = document.getElementById('swap');
let hideUnhideButt = document.getElementById('hide-unhide');
// let playerParentDiv = document.getElementById('player-parent-old');
// let playerParentDiv;

logButt.onclick = function(){ console.log(getRabbitCoords()); };
swapButt.onclick = swapFunc;
hideUnhideButt.onclick = function(){
    // console.log("hideunhide");

    // get a reference to the div that contains our video player
    let videoPlayerDiv = L.DomUtil.get('player-parent');
    
    // store the opposite of its current state in "newHiddenState"
    let newHiddenState = !videoPlayerDiv.hidden;

    // set the div's hidden attribute to "newHiddenState"
    videoPlayerDiv.hidden = newHiddenState;
    
    // if the newHiddenState is true, it wants to be hidden
    // so we need to hide it AND the Rabbit Marker
    if(newHiddenState){
        console.log("hidden state is:", newHiddenState, "attempting to HIDE.");
        rabbitMarker.remove();//map.removeLayer(rabbitMarker);
    } 
    // otherwise, if newHiddenState is false, we want to show it and the rabbit
    else {
        rabbitMarker.addTo(map);
        console.log("hidden state is:", newHiddenState, "attempting to SHOW.");
    }
    
}


function swapFunc(){
    console.log("swap");

    let geoJsonSwapped = swapRideMapData();

    let youTubeVideoID = geoJsonSwapped.metadata.youTubeVideoID;


    if(!player){
        placeholderVideoID = youTubeVideoID;
        createYouTubeVideoPlayer();
    }
    else{
        loadYouTubeVideo(youTubeVideoID);
    }
    
}


function loadYouTubeVideo(youTubeVideoID){

    // console.log(youTubeVideoID);
    player.cueVideoById(youTubeVideoID);

}



// swaps out the geoJson that is displayed on the map along with the rabbit marker
function swapRideMapData(){
    
    showBernalRide = !showBernalRide;

    let geoJsonToSwap = (showBernalRide) ? bernalJSON : lahondaJSON;

    coordsArray = getCoordsArrayFromGeoJson(geoJsonToSwap);
    coordsArrayLength = coordsArray.length;

    displayGeoJsonLayer(geoJsonToSwap);
    
    let flyToLatLon = coordsArray[Math.round(coordsArray.length / 2)].slice(0, 2).reverse();
    map.flyTo(flyToLatLon, defaultRideViewZoom, {animate: true, duration: 1});

    rabbitMarker.remove();
    rabbitMarker = undefined;
    syncRabbitMarkerToVideo("frameIndex", 0);

    return geoJsonToSwap;
}










// prints a bunch of info for the rabbit
function printRabbitInfo(){

    let vDuration = player.getDuration();
    let vCurrentTime = player.getCurrentTime();    
    let currentFrameNum = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    // let currentFrame = Math.round(vCurrentTime * framesPerSecond);
    let percentWatched = vCurrentTime/vDuration;
    let calculatedCurrentFrame = Math.round(percentWatched * coordsArrayLength);

    syncRabbitMarkerToVideo("frameIndex", currentFrameNum);
    // syncRabbitMarkerToVideo("percentWatched", percentWatched);

    console.log("######### STATS 1 ###########");
    console.log("video duration:", vDuration);
    console.log("current time:", vCurrentTime);
    console.log("% watched:", (percentWatched * 100).toFixed(2) + "%");
    
    
    console.log("######### STATS 2 ###########");
    console.log("current frame index (fps):", currentFrameNum);
    console.log("coords length:", coordsArrayLength);
    console.log("calculated frame index (% watched * coordslength):", calculatedCurrentFrame);
    
    console.log("difference ((% watched * coords length) - (frame index * 15fps)):", calculatedCurrentFrame - currentFrameNum);

    console.log(getRabbitCoords());
}