let mycount = 0;
let framesPerSecond = 15;
let frameOffset = initialRideJSON.metadata.frameOffset;
frameOffset = 0;
let rabbitUpdateInterval = 250; // time in milliseconds between updating the rabbit
let rabbitSyncIntervalTimerID;

// youtube video embed size variables
let videoHeight = 250;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};
let videoEmbedCode = initialRideJSON.metadata.videoEmbedID;

// embed HTML code used to create the embeded video objects
let videoEmbedParams = {
  firstHalf: '<iframe width="' + videoWidth + '" height="' + videoHeight + '" src="https://www.youtube.com/embed/',
  secondHalf: '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
};


let playButtonClass = "play";
let pauseButtonClass = "pause";
let stopButtonID = "stop";



// YOUTUBE CODE
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    
    console.log("YOUTUBE IFRAME API READY");


}

function createYouTubeVideoPlayer(){
    player = new YT.Player('player', {
        height: String(videoHeight),
        width: String(videoWidth),
        videoId: videoEmbedCode,
        playerVars: { 
                        // 'autoplay': 1, 
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
        // controls: 0
    });
}





function onPlayerError(e){
    console.log("ERROR ERROR ERROR");
    console.log(e);

}



// YOUTUBE CODE
// 2. This code loads the IFrame Player API code asynchronously.
// var tag = document.createElement('script');

// tag.src = "https://www.youtube.com/iframe_api";
// var firstScriptTag = document.getElementsByTagName('script')[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// // 3. This function creates an <iframe> (and YouTube player)
// //    after the API code downloads.
// var player;
// function onYouTubeIframeAPIReady() {
//     player = new YT.Player('player', {
//         height: String(videoHeight),
//         width: String(videoWidth),
//         videoId: videoEmbedCode,
//         playerVars: { 
//                         // 'autoplay': 1, 
//                         'controls': 1, 
//                         'disablekb': 1,
//                         'modestbranding': 1,
//                         'playsinline': 1,
//                         'rel': 0
//                     },
//         events: {
//         'onReady': onPlayerReady,
//         'onStateChange': onPlayerStateChange
//         },
//         // controls: 0
//     });
// }

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // event.target.hideVideInfo = true;
    console.log("PLAYER READY");
    // event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.

function onPlayerStateChange(event) {

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
            if(mycount === 0){
                startRabbitSyncronizer();
                mycount += 1;
            }
            startRabbitSyncronizer();
        case YT.PlayerState.BUFFERING:
            playPauseButton.className = pauseButtonClass;
            break;
        // notice we don't have a "break;" below for the "ENEDED" state because we want to update the button in both the ended and paused states. Leaving out the break means the code in both cases will execute if the state is "ENDED"
        // (ended) -- what happens when the video finishes playing on its own
        case YT.PlayerState.ENDED:
            stopRabbitSyncronizer();
            printRabbitInfo();
        // (paused) -- what happens when the user pauses the video, or scrubs the playhead (we don't stop the rabbit syncronizer because we want the rabbit to continue updating if the user scrubs the playhead while the video is paused)
        case YT.PlayerState.PAUSED:
            // stopRabbitSyncronizer();
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



// ################## VIDEO CONTROL BUTTONS & HANDLERS ##################
let playPauseButton = document.getElementById('play-pause');
let stopButton = document.getElementById('stop')


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

// ################## OTHER FUNCTIONS ##################

function startRabbitSyncronizer() {

    // this "if" statement prevents us from generating additional interval timers in the case that we already have one running
    // we want to be careful not to generate more than one due to the way garbage collection works with these timers
    // we just have to make sure that everytime we call clearInterval(ID) we need to set "rabbitSyncIntervalTimerID" to undefined
    if(rabbitSyncIntervalTimerID === undefined){
        console.log("starting rabbit syncronization (interval timer)");
        
        rabbitSyncIntervalTimerID = window.setInterval( updateRabbitPosition, rabbitUpdateInterval);
        // console.log(rabbitSyncIntervalTimerID);
    }

}

function stopRabbitSyncronizer(){
    console.log("stopping rabbit syncronization (interval timer)");
    
    // garbage collection
    clearInterval(rabbitSyncIntervalTimerID);
    
    // this lets our "startRabbitSyncronizer()" function know we need a new one
    rabbitSyncIntervalTimerID = undefined;
    // updateRabbitPosition();
}


function updateRabbitPosition(){

    let vDuration = player.getDuration();
    let vCurrentTime = player.getCurrentTime();
    
    let currentFrameNum = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    syncRabbitMarkerToVideo("frameIndex", currentFrameNum);

    let percentWatched = vCurrentTime/vDuration;
    // syncRabbitMarkerToVideo("percentWatched", percentWatched);
}


