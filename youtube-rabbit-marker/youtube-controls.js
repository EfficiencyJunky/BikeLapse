let framesPerSecond = 15;
let frameOffset = rideJSON.metadata.frameOffset;
let rabbitUpdateInterval = 250; // time in milliseconds between updating the rabbit
let intervalTimer;

// youtube video embed size variables
let videoHeight = 300;
let videoWidth = Math.round(videoHeight * 1.777777);
let bindPopupProperties = {maxWidth: videoWidth + 40};
let videoEmbedCode = rideJSON.metadata.videoEmbedID;

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
        'onStateChange': onPlayerStateChange
        },
        // controls: 0
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    event.data gives the state of the player (state=1),
//    these are the possible states 
//    (use static member "YT.PlayerState.{STATE_NAME}" to make code more readable when identifying the state returned by event.data )
        // -1 (unstarted)
        // 0 (ended)
        // 1 (playing)
        // 2 (paused)
        // 3 (buffering)
        // 5 (video cued)
function onPlayerStateChange(event) {

    // event.data in this case is one of the state=
    switch(event.data){
        case YT.PlayerState.PLAYING:
            updatePlayPauseButtonClass("playing", pauseButtonClass);
            startInterval();
            break;
        case YT.PlayerState.BUFFERING:
            updatePlayPauseButtonClass("buffering", pauseButtonClass);
            break;
        case YT.PlayerState.PAUSED:
            updatePlayPauseButtonClass("paused", playButtonClass);
            stopInterval();
            break;
        case YT.PlayerState.ENDED:            
            updatePlayPauseButtonClass("ended", playButtonClass);
            stopInterval();
            printRabbitInfo();
            break;
        case -1:
            updatePlayPauseButtonClass("unstarted", playButtonClass);
            stopInterval();
            showRabbitMarker(0, "frameNum");
            break;
        case YT.PlayerState.CUED:
            console.log("cued");
            break;
        default:
            console.log("GetPlayerState:", player.getPlayerState());
            break;
    }

    function updatePlayPauseButtonClass(logText, buttonClass){

        console.log(logText);
        document.getElementById('play-pause').className = buttonClass;
        
    }


}



// ################## VIDEO CONTROL BUTTON HANDLERS ##################
document.getElementById('play-pause').onclick = videoTransportButtonsHandler;
document.getElementById('stop').onclick = videoTransportButtonsHandler;

function videoTransportButtonsHandler(event) {

    let button = event.target;
    
    if(button.className === playButtonClass){
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

function startInterval(e) {
    console.log("starting interval timer");
    intervalTimer = window.setInterval( updateRabbitPosition, rabbitUpdateInterval);
}

function stopInterval(e){
    console.log("stopping interval timer");
    clearInterval(intervalTimer);
}


function updateRabbitPosition(e){

    let vDuration = player.getDuration();
    let vCurrentTime = player.getCurrentTime();
    
    let vCurrentFrame = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    let percentWatched = vCurrentTime/vDuration;
    
    showRabbitMarker(vCurrentFrame, "frameNum");
    // showRabbitMarker(percentWatched, "percentComplete");

}


function printRabbitInfo(){

    let vDuration = player.getDuration();
    let vCurrentTime = player.getCurrentTime();    
    let vCurrentFrame = Math.round(vCurrentTime * framesPerSecond) + frameOffset;
    // let vCurrentFrame = Math.round(vCurrentTime * framesPerSecond);
    let percentWatched = vCurrentTime/vDuration;
    let calculatedCurrentFrame = Math.round(percentWatched * coordsArrayLength);

    showRabbitMarker(vCurrentFrame, "frameNum");

    console.log("######### STATS 1 ###########");
    console.log("video duration:", vDuration);
    console.log("current time:", vCurrentTime);
    console.log("% watched:", (percentWatched * 100).toFixed(2) + "%");
    
    
    console.log("######### STATS 2 ###########");
    console.log("current frame (fps):", vCurrentFrame);
    console.log("coords length:", coordsArrayLength);
    console.log("calculated frame (coordslength * % watched):", calculatedCurrentFrame);
    
    console.log("difference:", calculatedCurrentFrame - vCurrentFrame);

    getRabbitCoords();
}