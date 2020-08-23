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


// ################## GETTERS AND SETTERS ##################
// ################## GETTERS AND SETTERS ##################
// ################## GETTERS AND SETTERS ##################
function getCurrentVideoFrameIndex(){
    //current time of the playhead (a float that is accurate to many milliseconds)
    const vCurrentTime = player.getCurrentTime();
    const vDuration = player.getDuration();

    return frameIndex = Math.round(vCurrentTime * framesPerSecond) + getFrameOffsetFromCurrentTime(vCurrentTime, vDuration);
    
    // return frameIndex = Math.round(vCurrentTime * framesPerSecond);
}

function getVideoDurationInFrames(){

    //duration of video (a float that is accurate to many milliseconds)
    const vDuration = player.getDuration();

    return Math.round(vDuration * framesPerSecond);
}

function getVideoDuration(){
    return player.getDuration();
}

// this is where we set the length of the linestring to check against the video length
// we pass in the callback because we won't know the video length until the user preses play on the video
// so the callback is what we use to send the actual frameoffset back to the 
function setLinestringLengthToCheckAgainstVideoDuration(linestringLengthToCheck, frameOffsetCallback){

    _linestringLengthToCheck = linestringLengthToCheck;
    _frameOffsetCallback = frameOffsetCallback;
}

// returns the current frameoffset
function getFrameOffset(){
    return _frameOffset;
}

// sets the current frameoffset
function setFrameOffset(frameOffset){
    _frameOffset = frameOffset;
}

// calculates the number of frames to add based on our frameOffset and the current time within the video
function getFrameOffsetFromCurrentTime(currentTime, duration){

    // if the frameOffset is 0, just return 0
    if(_frameOffset === 0){return 0;}

    // otherwise, calculate the number of frames to add
    let framesToAdd = Math.round(_frameOffset / duration * currentTime);
    
    // make sure it's not NaN, or Infinite (in case of divide by Zero)
    if(!isFinite(framesToAdd)){
      framesToAdd = 0;
    }

    // console.log("add", framesToAdd, "frames");

    // return the number of frames to add
    return framesToAdd;

}



// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
let player;
let framesPerSecond = 15;
let _frameOffset = 0;
let rabbitAndSliderSyncInterval = 250; // time in milliseconds between updating the rabbit
let rabbitAndSliderSyncTimerID;
const playbackRatesArray = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];
let playbackRateIndex = 3;
const defaultPlaybackRateIndex = playbackRateIndex;

let _linestringLengthToCheck;
let _frameOffsetCallback;

let consoleLogsOn = false;

// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// BUTTONS
// references to our video control buttons
let playPauseButton = document.getElementById('play-pause');
let stopButton = document.getElementById('stop');
let playbackRateButton = document.getElementById('playback-rate');

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
        videoId: "",
        // Learn about the playerVars here: https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5
        playerVars: youTubePlayerOptions,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError,
            'onPlaybackRateChange': onPlaybackRateChange
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
    let logText =       playerState === YT.PlayerState.CUED      ? "cued" :
                        playerState === YT.PlayerState.UNSTARTED ? "unstarted" :
                        // playerState === YT.PlayerState.BUFFERING ? "buffering" :
                        // playerState === YT.PlayerState.PLAYING   ? "playing" :
                        // playerState === YT.PlayerState.PAUSED    ? "paused" :
                        // playerState === YT.PlayerState.ENDED     ? "ended" :
                        // String("GetPlayerState: " + player.getPlayerState());
                        false;

    // let the people know what our lovely YouTube player is up to
    if(logText && consoleLogsOn){
        console.log(logText);
    }


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
            startRabbitAndSliderSyncronizer();
            if(_linestringLengthToCheck){
                checkIfVideoDurationAndLineStringLengthMatch();
            }
        case YT.PlayerState.BUFFERING:
            playPauseButton.className = pauseButtonClass;
            break;
        // notice we don't have a "break;" below for the "ENEDED" state because we want to update the button in both the ended and paused states. Leaving out the break means the code in both cases will execute if the state is "ENDED"
        // (ended) -- what happens when the video finishes playing on its own
        case YT.PlayerState.ENDED:
            updateUIElementsFromVideoTimeStamp();    
            // printRabbitInfo();  // can eventually remove this
        // (unstarted) -- what happens when the video is initially loaded and ready, or is "stopped" by the player.stopVideo(); command
        case YT.PlayerState.UNSTARTED:            
            stopRabbitAndSliderSyncronizer();
        // (paused) -- what happens when the user pauses the video, or scrubs the playhead (we don't stop the rabbit syncronizer because we want the rabbit to continue updating if the user scrubs the playhead while the video is paused)
        case YT.PlayerState.PAUSED:
            playPauseButton.className = playButtonClass;
            break;
        // (cued) -- also happens when video is "stopped" by the player.stopVideo(); command (which we send when the ride is removed from the map)
        case YT.PlayerState.CUED:
            playPauseButton.className = playButtonClass;
            // stopRabbitAndSliderSyncronizer();
            updateUIElementsFromVideoTimeStamp();
            
            playbackRateIndex = defaultPlaybackRateIndex;
            player.setPlaybackRate(playbackRatesArray[playbackRateIndex]);
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


function onPlaybackRateChange(event){
    
    let playbackRate = event.data;

    playbackRateButton.innerHTML = playbackRate + "x";
}






// ################## PRIVATE RABBIT UPDATE METHODS ##################
// ################## PRIVATE RABBIT UPDATE METHODS ##################
// ################## PRIVATE RABBIT UPDATE METHODS ##################

// stops the currently running interval timer who's ID is stored in "rabbitAndSliderSyncTimerID"
function stopRabbitAndSliderSyncronizer(){
    (consoleLogsOn === true) ? console.log("STOP - interval timer") : undefined;
    
    // garbage collection
    clearInterval(rabbitAndSliderSyncTimerID);
    
    // this lets our "startRabbitAndSliderSyncronizer()" function know we need a new one
    rabbitAndSliderSyncTimerID = undefined;
}


// starts an interval timer that updates the rabbit's position every "rabbitAndSliderSyncInterval" milliseconds
function startRabbitAndSliderSyncronizer() {
    // this "if" statement prevents us from generating additional interval timers in the case that we already have one running
    // we want to be careful not to generate more than one due to the way garbage collection works with these timers
    // we just have to make sure that everytime we call clearInterval(ID) we need to set "rabbitAndSliderSyncTimerID" to undefined
    if(rabbitAndSliderSyncTimerID === undefined){
        (consoleLogsOn === true) ? console.log("START - interval timer") : undefined;
        
        rabbitAndSliderSyncTimerID = window.setInterval( updateUIElementsFromVideoTimeStamp, rabbitAndSliderSyncInterval);
    }

}



// this is how we move the rabbit around the map
// we get the frame index of the video, 
// and use that as the index into the coordsArray
// in the LineString of our GeoJSON file
function updateUIElementsFromVideoTimeStamp(){

    //current time of the playhead (a float that is accurate to many milliseconds)
    const vCurrentTime = player.getCurrentTime();
    const vDuration = player.getDuration();
    
    // we only want to update the rabbit and ride stats if "showRabbitOnRoute" is true
    if(showRabbitOnRoute){
        

        // multiply that time by 15 frames per second (the framerate of BikeLapse videos)
        // rounding it first is smart tho. And for future we can add a frameOffset
        // to get our frame Index and then send that to the "syncRabbitMarkerToVideo" function
        let frameIndex = Math.round(vCurrentTime * framesPerSecond) + getFrameOffsetFromCurrentTime(vCurrentTime, vDuration);

        syncRabbitMarkerToVideo("frameIndex", frameIndex);
        // setRabbitLatLonFromFrameIndex();

        syncCumulativeRideStatsToVideo("frameIndex", frameIndex);

        // duration only is reported once the video starts playing
        // if the video has just been cued, the duration will return 0
        // we need to avoid divide by 0 so we add some extra safeguards here
        // let vDuration = player.getDuration();
        // let percentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0.0;
        // syncRabbitMarkerToVideo("percentWatched", percentWatched);
    }


    if(sliderAvailable){        
        // duration only is reported once the video starts playing
        // if the video has just been cued, the duration will return 0
        // we need to avoid divide by 0 so we add some extra safeguards here
        let percentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0.0;
        slider.value = percentWatched*100;
    }
}



function checkIfVideoDurationAndLineStringLengthMatch(){

    const videoFrameCount = getVideoDurationInFrames();
    const highRange = _linestringLengthToCheck + 10;
    const lowRange = _linestringLengthToCheck - 10;

    if(videoFrameCount <= lowRange || videoFrameCount >= highRange){
        alert(  `VIDEO DURATION AND LENGTH OF LINESTRING DO NOT MATCH\n` +
                `${videoFrameCount} -- Video length in frames\n` +
                `${_linestringLengthToCheck} -- Linestring coordinates array length\n` +
                `In order for bikelapse to work, the two need to be nearly identical\n` +
                `Make sure you've selected the right video for the GPX file imported\n` +
                `Or select the "No" radio button to stop this popup from happening\n`
             );
    }
    else{
        console.log("video frame count", videoFrameCount);
        console.log("linestring length", _linestringLengthToCheck);
    }

    _frameOffset = _linestringLengthToCheck - videoFrameCount;

    _frameOffsetCallback(_frameOffset);

}







// $$$$$$$ REMOVE THIS IN FINAL VERSION $$$$$$$$$
// prints a bunch of info for the rabbit
// function printRabbitInfo(){

//     if(showRabbitOnRoute){
//         const vDuration = player.getDuration();
//         const vCurrentTime = player.getCurrentTime();    
//         const currentFrameNum = Math.round(vCurrentTime * framesPerSecond) + getFrameOffsetFromCurrentTime(vCurrentTime, vDuration);
//         // let currentFrame = Math.round(vCurrentTime * framesPerSecond);
        
//         let percentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0.0;
//         let calculatedCurrentFrame = Math.round(percentWatched * rabbitCoordsArray.length);

//         syncRabbitMarkerToVideo("frameIndex", currentFrameNum);
//         // syncRabbitMarkerToVideo("percentWatched", percentWatched);

//         console.log("######### STATS 1 ###########");
//         console.log("video duration:", vDuration);
//         console.log("current time:", vCurrentTime);
//         console.log("% watched:", (percentWatched * 100).toFixed(2) + "%");
        
        
//         console.log("######### STATS 2 ###########");
//         console.log("current frame index (fps):", currentFrameNum);
//         console.log("coords length:", rabbitCoordsArray.length);
//         console.log("calculated frame index (% watched * coordslength):", calculatedCurrentFrame);
        
//         console.log("difference ((% watched * coords length) - (frame index * 15fps)):", calculatedCurrentFrame - currentFrameNum);

//         console.log(getRabbitCoords());
//     }
// }






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

    // the second argument tells the video to keep playing from the new position in the case that it was already playing before we told it to seek
    let vTimeToSeekTo = vDuration*sliderValue/100;
    player.seekTo(vTimeToSeekTo, true);
    
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


// PLAYBACK RATE BUTTON HANDLER SETUP
if(playbackRateButton !== null){
    playbackRateButton.onclick = playbackButtonHandler;
}

// when the playback-button is pressed, we want to cycle through the playback options
// as defined in the playbackRatesArray
function playbackButtonHandler(event){

    // increment the playbackRateIndex and 
    // if it is greater than or equal to the length of the playbackRatesArray
    // we should reset it to 0, otherwise just use the newly incremented value
    playbackRateIndex = ((playbackRateIndex += 1) >= playbackRatesArray.length) ?
                                 0 : playbackRateIndex;

    // grab the playback rate specified at that index in the playbackRatesArray
    const newPlaybackRate = playbackRatesArray[playbackRateIndex];
    
    // if the newPlaybackRate is one of the available rates, set the playbackRate to the new rate
    if(player.getAvailablePlaybackRates().includes(newPlaybackRate)){
        player.setPlaybackRate(newPlaybackRate);
    }
    // if the newPlaybackRate is NOT one of the available rates, 
    // recursively call our function to do it all again until we find one that works
    // worst case we land back at 1.0 and the button appears to do nothing
    else{        
        console.log(`playback rate "${newPlaybackRate}" not allowed`);
        console.log(`Available playback rates are: ${player.getAvailablePlaybackRates()}`);
        playbackButtonHandler();
    }
}