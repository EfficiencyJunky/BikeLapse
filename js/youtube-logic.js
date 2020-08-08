let player;


// YOUTUBE CODE
// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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

    return;
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



// THIS HAPPENS VERY RARELY. LIKE WHEN THE PLAYER LOADS AN INVALID VIDEO ID AND THEN THE USER PRESSES PLAY
function onPlayerError(e){
    console.log('ERROR YouTube API "onPlayerError"');
    console.log(e);

}






// ################## YOUTUBE API HELPER FUNCTIONS ##################
// ################## YOUTUBE API HELPER FUNCTIONS ##################
// ################## YOUTUBE API HELPER FUNCTIONS ##################

function loadYouTubeVideo(youTubeVideoID){
    player.cueVideoById(youTubeVideoID);
}













// ################## RABBIT FUNCTIONS ##################
// ################## RABBIT FUNCTIONS ##################
// ################## RABBIT FUNCTIONS ##################

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
    // let vDuration = player.getDuration();
    // let percentWatched = vCurrentTime/vDuration;
    // syncRabbitMarkerToVideo("percentWatched", percentWatched);
}















