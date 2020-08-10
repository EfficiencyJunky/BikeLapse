let framesPerSecond = 15;
// let frameOffset = initialRideJSON.metadata.frameOffset;
let frameOffset = 0;
let rabbitUpdateInterval = 250; // time in milliseconds between updating the rabbit
let rabbitSyncIntervalTimerID;

// youtube video embed size variables
let videoHeight = 200;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};
let placeholderVideoID = initialRideJSON.metadata.youTubeVideoID;


// for selecting/modifying buttons
let playButtonClass = "play";
let pauseButtonClass = "pause";
let stopButtonID = "stop";



// YOUTUBE CODE
// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2.1 This function creates an <iframe> (and YouTube player)
//    after the API code downloads. It fires automatically.
var player;
function onYouTubeIframeAPIReady() {
    
    console.log("YOUTUBE IFRAME API READY");
    createYouTubeVideoPlayer();

}


// 2.2. This function creates an actual YT.Player object
//      and loads the video stored in "placeholderVideoID"
function createYouTubeVideoPlayer(){
    player = new YT.Player('player', {
        height: String(videoHeight),
        width: String(videoWidth),
        videoId: placeholderVideoID,
        playerVars: { 
                        // 'autoplay': 1, 
                        'controls': 0,
                        'controls': 1, 
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
    console.log(logText);

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
            printRabbitInfo();    
            stopRabbitSyncronizer();
        // (paused) -- what happens when the user pauses the video, or scrubs the playhead (we don't stop the rabbit syncronizer because we want the rabbit to continue updating if the user scrubs the playhead while the video is paused)
        case YT.PlayerState.PAUSED:
            playPauseButton.className = playButtonClass;
            stopRabbitSyncronizer();
            break;
        // (unstarted) -- what happens when the video is initially loaded and ready, or is "stopped" by the player.stopVideo(); command
        case YT.PlayerState.UNSTARTED:
            playPauseButton.className = playButtonClass;
            stopRabbitSyncronizer();
            syncRabbitMarkerToVideo("frameIndex", 0);
            // syncRabbitMarkerToVideo("percentWatched", 0);
            break;
        // (cued) -- also happens when video is "stopped" by the player.stopVideo(); command (not currently making use of this obviously!)
        case YT.PlayerState.CUED:
            playPauseButton.className = playButtonClass;
            break;
        default:
            break;
    }


}


// NOT EXACTLY SURE WHAT WOULD CAUSE THIS TO HAPPEN, BUT IT CAN HAPPEN APPARENTLY
function onPlayerError(e){
    console.log('ERROR YouTube API "onPlayerError" has been called ERROR');
    console.log(e);

}




// ################## HELPER FUNCTIONS ##################
// ################## HELPER FUNCTIONS ##################
// ################## HELPER FUNCTIONS ##################

function startRabbitSyncronizer() {

    // this "if" statement prevents us from generating additional interval timers in the case that we already have one running
    // we want to be careful not to generate more than one due to the way garbage collection works with these timers
    // we just have to make sure that everytime we call clearInterval(ID) we need to set "rabbitSyncIntervalTimerID" to undefined
    if(rabbitSyncIntervalTimerID === undefined){
        console.log("starting rabbit syncronization (interval timer)");
        
        rabbitSyncIntervalTimerID = window.setInterval( updateRabbitPosition, rabbitUpdateInterval);
    }

}


// stops the currently running interval timer who's ID is stored in "rabbitSyncIntervalTimerID"
function stopRabbitSyncronizer(){
    console.log("stopping rabbit syncronization (interval timer)");
    
    // garbage collection
    clearInterval(rabbitSyncIntervalTimerID);
    
    // this lets our "startRabbitSyncronizer()" function know we need a new one
    rabbitSyncIntervalTimerID = undefined;
}


// this is how we move the rabbit around the map
// we get the frame index of the video, 
// and use that as the index into the coordsArray
// in the LineString of our GeoJSON file
function updateRabbitPosition(){

    //current time of the playhead (a float that is accurate to many milliseconds)
    let vCurrentTime = player.getCurrentTime();
    
    // multiply that time by 15 frames per second (the framerate of BikeLapse videos)
    // rounding it first is smart tho. And for future we can add a frameOffset
    // to get our frame Index and then send that to the "syncRabbitMarkerToVideo" function
    let frameIndex = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    syncRabbitMarkerToVideo("frameIndex", frameIndex);


    // if we wanted to just calculate the percent of the video watched we can uncomment this code
    let vDuration = player.getDuration();
    let percentWatched = vCurrentTime/vDuration;
    slider.value = percentWatched*100;
    // syncRabbitMarkerToVideo("percentWatched", percentWatched);
}

























// ################## VIDEO CONTROL BUTTONS & HANDLERS ##################
let playPauseButton = document.getElementById('play-pause');
let stopButton = document.getElementById('stop');


playPauseButton.onclick = videoTransportButtonsHandler;
stopButton.onclick = videoTransportButtonsHandler;


function videoTransportButtonsHandler(event) {

    let button = event.target;
    
    if(button.className === playButtonClass){
        // console.log("attempting to play");
        player.playVideo();
    }
    else if(button.className === pauseButtonClass){
        player.pauseVideo();
    }
    else if(button.id === stopButtonID){
        player.stopVideo();
    }

}


// SLIDER
let slider = document.getElementById('slider');
let videoDuration;

slider.onchange = function(event){

    console.log("onchange");
    console.log(event.target.value);

    let sliderValue = event.target.value;
    let vDuration = player.getDuration();
    player.seekTo(vDuration*sliderValue/100, true);
    

}

slider.oninput = function(event){
    console.log("oninput");
    console.log(event.target.value);
    
    player.pauseVideo();
    let sliderVal = event.target.value;

    syncRabbitMarkerToVideo("frameIndex", frameIndex);
}
