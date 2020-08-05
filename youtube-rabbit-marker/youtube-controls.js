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
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// -1 (unstarted)
// 0 (ended)
// 1 (playing)
// 2 (paused)
// 3 (buffering)
// 5 (video cued)
function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.PLAYING){
        // console.log("playing");
        startInterval();
    }
    else if (event.data === YT.PlayerState.PAUSED){
        // console.log("paused");
        stopInterval();
    }
    else if (event.data === YT.PlayerState.ENDED){
        console.log("ended");
        stopInterval();
        // getRabbitCoords();
        printRabbitInfo();
    }
    else if (event.data === YT.PlayerState.BUFFERING){
        console.log("buffering");
        // console.log("video duration:", player.getDuration());
        // console.log("Current time:", player.getCurrentTime());
    }
    else if (event.data === YT.PlayerState.CUED){
        console.log("cued");
    }
    else if (event.data === -1){
        console.log("unstarted");
        stopInterval();
    }
    else{
        console.log("GetPlayerState:", player.getPlayerState());
        // console.log("Event.data:", event.data);
        // console.log("event", event);
    }

}



// ################## BUTTONS: VIDEO CONTROL FUNCTIONS ##################

document.getElementById('play').onclick = play;;
document.getElementById('pause').onclick = pause;;
document.getElementById('stop').onclick = stop;;

function play() {
    player.playVideo();
}

function pause() {
    player.pauseVideo();
}

function stop() {
    player.stopVideo();
}


// ################## BUTTONS: OTHER FUNCTIONS ##################


document.getElementById('startIntervalButton').onclick = startInterval;
document.getElementById('stopIntervalButton').onclick = stopInterval;
document.getElementById('logButton').onclick = printRabbitInfo;


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
    // showRabbitMarker(vCurrentTime);

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