// ################## "PUBLIC" METHODS ##################
// ################## "PUBLIC" METHODS ##################
// ################## "PUBLIC" METHODS ##################
function loadYouTubeVideo(youTubeVideoID){
    // console.log("loading new video");
    player.cueVideoById(youTubeVideoID);
}

function stopYouTubeVideo(){
    player.stopVideo();
}

function playYouTubeVideo(){
    player.playVideo();
}

function pauseYouTubeVideo(){
    player.pauseVideo();
}


// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
let player;
let framesPerSecond = 15;
let frameOffset = 0;
let rabbitUpdateInterval = 250; // time in milliseconds between updating the rabbit
let rabbitSyncIntervalTimerID;

// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// BUTTONS
// references to our video control buttons
let playPauseButton = document.getElementById('play-pause');
let stopButton = document.getElementById('stop')

// for updating the playPauseButton's class to change its CSS and content
let playButtonClass = "play";
let pauseButtonClass = "pause";

// SLIDER
let slider = document.getElementById('slider');
let sliderAvailable = true;

// YOUTUBE PLAYER INITIALIZATION
// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



// ################## PRIVATE YOUTUBE PLAYER METHODS ##################
// ################## PRIVATE YOUTUBE PLAYER METHODS ##################
// ################## PRIVATE YOUTUBE PLAYER METHODS ##################
// 2. This function creates an <iframe> (and YouTube player)
//    after the API code downloads. It fires automatically.
function onYouTubeIframeAPIReady() {
    
    console.log("YOUTUBE IFRAME API READY");
    player = new YT.Player('player', {
        height: String(videoHeight),
        width: String(videoWidth),
        videoId: "Kb1YkCAQzmo",
        playerVars: { 
                        // 'autoplay': 1, 
                        'controls': 0, 
                        'disablekb': 1,
                        'modestbranding': 1,
                        'playsinline': 1,
                        'rel': 0
                    },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        },
        
    });

}


// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    console.log("PLAYER READY");

    // if we want the video to autoplay we can uncomment out this code
    // (although we could set 'autoplay': 1 in the "playerVars" of the YT.Player object)
    // event.target.playVideo();
}



// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {

    // event.data is a number that represents the state of the player
    // so we grab that number and give it an easy to remember name
    let playerState = event.data;

    // an efficient way to structure "if/else" statements for purposes like this
    // converts the YT.PlayerState.{STATE_NAME} into human readable text
    let logText =       playerState === YT.PlayerState.PLAYING   ? "playing" :
                        playerState === YT.PlayerState.BUFFERING ? "buffering" :
                        playerState === YT.PlayerState.PAUSED    ? "paused" :
                        playerState === YT.PlayerState.ENDED     ? "ended" :
                        playerState === YT.PlayerState.UNSTARTED ? "unstarted" :
                        playerState === YT.PlayerState.CUED      ? "cued" :
                        String("GetPlayerState: " + player.getPlayerState());

    // let the people know what our lovely YouTube player is up to
    // console.log(logText);

    // return;


    // playerState (event.data) gives us the state of the player (i.e. state=1 (playing), state=2 (paused)),
    // we use static member "YT.PlayerState.{STATE_NAME}" to make code more readable when identifying the state returned by playerState (event.data)
    // these are the possible states 
    // -1 (unstarted) -- the only state that doesn't have a YT.PlayerState static member
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    switch(playerState){
        // notice we don't have a "break;" for the "PLAYING" state below because we want to update the button in both the ended and paused states. Leaving out the break means the code in both cases will execute if the state is "PLAYING"
        case YT.PlayerState.PLAYING:
            startRabbitSyncronizer();
        case YT.PlayerState.BUFFERING:
            playPauseButton.className = pauseButtonClass;
            break;
        // notice we don't have a "break;" below for the "ENEDED" state because we want to update the button in both the ended and paused states. Leaving out the break means the code in both cases will execute if the state is "ENDED"
        // (ended) -- what happens when the video finishes playing on its own
        case YT.PlayerState.ENDED:
            if(videoHasBikeLapseSync){
                printRabbitInfo();    
            }
            stopRabbitSyncronizer();
        // (paused) -- what happens when the user pauses the video, or scrubs the playhead (we don't stop the rabbit syncronizer because we want the rabbit to continue updating if the user scrubs the playhead while the video is paused)
        case YT.PlayerState.PAUSED:
            playPauseButton.className = playButtonClass;
            // stopRabbitSyncronizer();
            break;
        // (unstarted) -- what happens when the video is initially loaded and ready, or is "stopped" by the player.stopVideo(); command
        case YT.PlayerState.UNSTARTED:
            playPauseButton.className = playButtonClass;
            stopRabbitSyncronizer();
            updateRabbitPosition();
                    
            // console.log("unstarted");
            // if(videoHasBikeLapseSync){
            //     console.log("updateRabbitPosition -- UNSTARTED");
            //     updateRabbitPosition();
            //     // syncRabbitMarkerToVideo("frameIndex", 0);
            // }
            // else{
            //     updateVideoSliderPositionOnly();
            // }
            // syncRabbitMarkerToVideo("percentWatched", 0);
            break;
        // (cued) -- also happens when video is "stopped" by the player.stopVideo(); command (not currently making use of this obviously!)
        case YT.PlayerState.CUED:
            // stopRabbitSyncronizer();
            
            // console.log("cued");            
            playPauseButton.className = playButtonClass;
            break;
        default:
            break;
    }


}



// THIS HAPPENS VERY RARELY. LIKE WHEN THE PLAYER LOADS AN INVALID VIDEO ID AND THEN THE USER PRESSES PLAY
function onPlayerError(e){
    console.log('ERROR YouTube API "onPlayerError"');
    console.log(e);

}



// ################## PRIVATE RABBIT UPDATE METHODS ##################
// ################## PRIVATE RABBIT UPDATE METHODS ##################
// ################## PRIVATE RABBIT UPDATE METHODS ##################

// stops the currently running interval timer who's ID is stored in "rabbitSyncIntervalTimerID"
function stopRabbitSyncronizer(){
    // console.log("stopping rabbit syncronization (interval timer)");
    
    // garbage collection
    clearInterval(rabbitSyncIntervalTimerID);
    
    // this lets our "startRabbitSyncronizer()" function know we need a new one
    rabbitSyncIntervalTimerID = undefined;
}


// starts an interval timer that updates the rabbit's position every "rabbitUpdateInterval" milliseconds
function startRabbitSyncronizer() {
    // this "if" statement prevents us from generating additional interval timers in the case that we already have one running
    // we want to be careful not to generate more than one due to the way garbage collection works with these timers
    // we just have to make sure that everytime we call clearInterval(ID) we need to set "rabbitSyncIntervalTimerID" to undefined
    if(rabbitSyncIntervalTimerID === undefined){
        // console.log("starting rabbit syncronization (interval timer)");
        
        // if(videoHasBikeLapseSync){
            rabbitSyncIntervalTimerID = window.setInterval( updateRabbitPosition, rabbitUpdateInterval);
        // }
        // else{
        //     rabbitSyncIntervalTimerID = window.setInterval( updateVideoSliderPositionOnly, rabbitUpdateInterval);
        // }
    }

}


// this is how we move the rabbit around the map
// we get the frame index of the video, 
// and use that as the index into the coordsArray
// in the LineString of our GeoJSON file
function updateRabbitPosition(){

    //current time of the playhead (a float that is accurate to many milliseconds)
    let vCurrentTime = player.getCurrentTime();
    
    if(videoHasBikeLapseSync){
        // multiply that time by 15 frames per second (the framerate of BikeLapse videos)
        // rounding it first is smart tho. And for future we can add a frameOffset
        // to get our frame Index and then send that to the "syncRabbitMarkerToVideo" function
        let frameIndex = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
        syncRabbitMarkerToVideo("frameIndex", frameIndex);
        // setRabbitLatLonFromFrameIndex();

        // if we wanted to just calculate the percent of the video watched we can uncomment this code
        // let vDuration = player.getDuration();
        // let percentWatched = vCurrentTime/vDuration;
        // syncRabbitMarkerToVideo("percentWatched", percentWatched);
    }

    if(sliderAvailable){
        let vDuration = player.getDuration();
        let percentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0;
        slider.value = percentWatched*100;
    }
}

// this is how we move the rabbit around the map
// we get the frame index of the video, 
// and use that as the index into the coordsArray
// in the LineString of our GeoJSON file
// function updateVideoSliderPositionOnly(){
//     if(sliderAvailable){
//     //current time of the playhead (a float that is accurate to many milliseconds)
//         let vCurrentTime = player.getCurrentTime();
//         let vDuration = player.getDuration();
//         let percentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0;
//         slider.value = percentWatched*100;
//     }
// }







// prints a bunch of info for the rabbit
function printRabbitInfo(){

    let vDuration = player.getDuration();
    let vCurrentTime = player.getCurrentTime();    
    let currentFrameNum = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    // let currentFrame = Math.round(vCurrentTime * framesPerSecond);
    let percentWatched = vCurrentTime/vDuration;
    let calculatedCurrentFrame = Math.round(percentWatched * rabbitCoordsArray.length);

    syncRabbitMarkerToVideo("frameIndex", currentFrameNum);
    // syncRabbitMarkerToVideo("percentWatched", percentWatched);

    console.log("######### STATS 1 ###########");
    console.log("video duration:", vDuration);
    console.log("current time:", vCurrentTime);
    console.log("% watched:", (percentWatched * 100).toFixed(2) + "%");
    
    
    console.log("######### STATS 2 ###########");
    console.log("current frame index (fps):", currentFrameNum);
    console.log("coords length:", rabbitCoordsArray.length);
    console.log("calculated frame index (% watched * coordslength):", calculatedCurrentFrame);
    
    console.log("difference ((% watched * coords length) - (frame index * 15fps)):", calculatedCurrentFrame - currentFrameNum);

    console.log(getRabbitCoords());
}






// ################## VIDEO CONTROL BUTTONS/SLIDER HANDLERS ##################
// ################## VIDEO CONTROL BUTTONS/SLIDER HANDLERS ##################
// ################## VIDEO CONTROL BUTTONS/SLIDER HANDLERS ##################

if(playPauseButton !== null){
    playPauseButton.onclick = videoTransportButtonsHandler;
}
if(stopButton !== null){
    stopButton.onclick = videoTransportButtonsHandler;
}


function videoTransportButtonsHandler(event) {

    let button = event.target;
    
    if(button.className === playButtonClass){
        player.playVideo();
    }
    else if(button.className === pauseButtonClass){
        player.pauseVideo();
    }
    else if(button === stopButton){
        player.stopVideo();

    }

}


// "onchange" callback is triggered when we release the slider
// at which point we want to seek the video playhead to the placement of the slider
// and we can allow the slider to continue being updated by the YouTube player again
slider.onchange = function(event){

    let sliderValue = event.target.value;
    let vDuration = player.getDuration();

    player.seekTo(vDuration*sliderValue/100, true);
    
    sliderAvailable = true;
}

// "oninput" callback is triggered when we grab the slider and slide it around
// when the user is moving the slider around, we don't want its position
// to be updated with the playhead of the video, so we set "sliderAvailable" to false
// it is always called before "onchange"
slider.oninput = function(event){

    sliderAvailable = false;

    // player.pauseVideo();
    // let sliderVal = event.target.value;
}

















