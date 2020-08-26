// ################## "PUBLIC" METHODS ##################
// ################## "PUBLIC" METHODS ##################
// ################## "PUBLIC" METHODS ##################
function yt_loadYouTubeVideo(youTubeVideoID){
    // console.log("loading new video");
    _player.cueVideoById(youTubeVideoID);
}

function yt_stopYouTubeVideo(){
    _player.stopVideo();
}

function yt_playYouTubeVideo(){
    _player.playVideo();
}

function yt_pauseYouTubeVideo(){
    _player.pauseVideo();
}

function yt_seekToTimeFromFrameIndex(frameIndex){

    const playerState = _player.getPlayerState();    
    
    // console.log(playerState);

    switch(playerState){        
        case YT.PlayerState.ENDED:
        case YT.PlayerState.PLAYING:
        case YT.PlayerState.BUFFERING:
        case YT.PlayerState.PAUSED:

            // capture the duration in time for the video
            const vDuration = _player.getDuration();            
            
            // calculate the total number of frames + frame offset (duration of video in frames)
            // this should be the same length as the linestring coordinates array
            const vDurationFrames = Math.round(vDuration * _framesPerSecond) + _frameOffset;                                    
            
            // calculate the frameOffset for this specific frameIndex
            const frameOffset = Math.round(_frameOffset * (frameIndex / vDurationFrames ));
            
            // calculate the time to seek to by subtracting the frameoffset and dividing by frames per second
            const vTimeToSeekTo = (frameIndex - frameOffset) / _framesPerSecond;    

            // console.log("video duration", vDuration);
            // console.log("durationFrames", vDurationFrames);
            // console.log("frameIndex", frameIndex);
            // console.log("frameOffset", frameOffset);        
            // console.log("vTimeToSeekTo", vTimeToSeekTo);
            updateUIElementsFromVideoTime(vTimeToSeekTo);
            yt_updateSliderFromVideoTime(vTimeToSeekTo);
            
            _player.seekTo(vTimeToSeekTo, true);

            break;
        case YT.PlayerState.UNSTARTED:  
        case YT.PlayerState.CUED:
            break;
        default:
            break;

    }
    
}




// ################## PUBLIC GETTERS AND SETTERS ##################
// function yt_getCurrentVideoFrameIndex(vCurrentTime){
function yt_getFrameIndexFromVideoTime(vTime){

    const vCurrentTime = (vTime) ? vTime : _player.getCurrentTime();

    //duration of video (a float that is accurate to many milliseconds)
    // if video is cued this will be 0
    const vDuration = _player.getDuration();

    return frameIndex = Math.round(vCurrentTime * _framesPerSecond) + getFrameOffsetFromCurrentTime(vCurrentTime, vDuration);
    
    // return frameIndex = Math.round(vCurrentTime * framesPerSecond);
}






// THIS IS THE FUNCTION THAT SETS WHAT OUR FRAMEOFFSET IS FOR PLAYBACK
// sets the current frameoffset
function yt_setFrameOffset(frameOffset, allowOffsetOutsideOffsetTolerance = false){
    // first make sure the frameOffset is defined 
    // and less than our tolerance (unless we've sent the tolerance override)
    if( frameOffset !== undefined
        && (Math.abs(frameOffset) <= _frameOffsetTolerance || allowOffsetOutsideOffsetTolerance)){
            _frameOffset = frameOffset;

            // console.log("using frameOffset", frameOffset, "\nfor video playback");
    }
    else{        
        _frameOffset = 0;

        // console.log("frameOffset is", frameOffset, "\n not using for video playback");
    }
}

// returns the current frameoffset
function yt_getFrameOffsetTolerance(){
    return _frameOffsetTolerance;
}

// THIS IS ONLY USED FOR THE CREATE-RIDE INTERFACE
// because we won't know the video length until the user preses play on the video, we need to setup a callback to fire when the user presses play.
// the callback will send the video duration in frames
function yt_setFameOffsetCheckCallback(frameOffsetCallback){

    _frameOffsetCallback = frameOffsetCallback;
}



// ################## PRIVATE GETTERS AND SETTERS ##################
// ################## PRIVATE GETTERS AND SETTERS ##################
// ################## PRIVATE GETTERS AND SETTERS ##################
function getVideoDurationInFrames(){

    //duration of video (a float that is accurate to many milliseconds)
    const vDuration = _player.getDuration();

    return Math.round(vDuration * _framesPerSecond);
}

// calculates the number of frames to add based on our frameOffset and the current time within the video
function getFrameOffsetFromCurrentTime(currentTime, duration){

    // if the frameOffset is 0, just return 0
    if(_frameOffset === 0){return 0;}

    // otherwise, calculate the number of frames to add
    let framesToAdd = Math.round(_frameOffset / duration * currentTime);    

    // console.log("framesToAdd", framesToAdd);

    // make sure it's not NaN, or Infinite (in case of divide by Zero)
    if(!isFinite(framesToAdd)){        
      framesToAdd = 0;
    }

    // console.log("framesToAdd", framesToAdd, "\nframeOffset", _frameOffset);

    // return the number of frames to add
    return framesToAdd;

}


// // calculates the number of frames to add based on our frameOffset and the current time within the video
// function getTimeOffsetFromCurrentFrameIndex(currentFrame, duration){

//     // if the frameOffset is 0, just return 0
//     if(_frameOffset === 0){return 0;}

//     // otherwise, calculate the number of frames to add
//     let framesToAdd = Math.round(_frameOffset / duration * currentTime);    

//     // console.log("framesToAdd", framesToAdd);

//     // make sure it's not NaN, or Infinite (in case of divide by Zero)
//     if(!isFinite(framesToAdd)){        
//       framesToAdd = 0;
//     }

//     // console.log("framesToAdd", framesToAdd, "\nframeOffset", _frameOffset);

//     // return the number of frames to add
//     return framesToAdd;

// }







// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
// ################## "PRIVATE" VARIABLES ##################
let _player;
let _framesPerSecond = 15;
let _frameOffset = 0;
const _frameOffsetTolerance = 10;
let _rabbitAndSliderSyncTimerID;
const _rabbitAndSliderSyncInterval = 250; // time in milliseconds between updating the rabbit, slider, and cumulative stats display for bikelapse rides
const _playbackRatesArray = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];
const _defaultPlaybackRateIndex = _playbackRatesArray.indexOf(1.0);
let _playbackRateIndex = _defaultPlaybackRateIndex;

let _frameOffsetCallback;

const _consoleLogsOn = false;


// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// ################## MOCK CONSTRUCTOR ##################
// BUTTONS
// references to our video control buttons
let playPauseButton = document.getElementById('play-pause');
let playPauseButtonList = [playPauseButton];
let stopButton = document.getElementById('stop');
let playbackRateButton = document.getElementById('playback-rate');

// for updating the playPauseButton's class to change its CSS and content
const _playButtonClass = "play";
const _pauseButtonClass = "pause";

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
    _player = new YT.Player('player', {
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
    let logText =       
                        // playerState === YT.PlayerState.CUED      ? "cued" :
                        playerState === YT.PlayerState.UNSTARTED ? "unstarted" :
                        playerState === YT.PlayerState.BUFFERING ? "buffering" :
                        playerState === YT.PlayerState.PLAYING   ? "playing" :
                        playerState === YT.PlayerState.PAUSED    ? "paused" :
                        // playerState === YT.PlayerState.ENDED     ? "ended" :
                        // String("GetPlayerState: " + player.getPlayerState());
                        false;

    // let the people know what our lovely YouTube player is up to
    if(logText && _consoleLogsOn){
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
            if(_frameOffsetCallback){
                const videoFrameCount = getVideoDurationInFrames();
                _frameOffsetCallback(videoFrameCount);
            }        
        case YT.PlayerState.BUFFERING:            
            startRabbitAndSliderSyncronizer();
            setPlayPauseButtonsClass(_pauseButtonClass);
            break;
        // notice we don't have a "break;" below for the "ENEDED" state because we want to update the button in both the ended and paused states. Leaving out the break means the code in both cases will execute if the state is "ENDED"
        // (ended) -- what happens when the video finishes playing on its own
        case YT.PlayerState.ENDED:
            // we need to use "getDuration()" here because the youtube API is stupid and will report the wrong current time if we jump right to the end with the playhead slider
            const vDuration = _player.getDuration();
            
            //update UI
            updateUIElementsFromVideoTime(vDuration);

            //update slider            
            yt_updateSliderFromVideoTime(vDuration);
            
        // (unstarted) -- what happens when the video is initially loaded and ready, or is "stopped" by the player.stopVideo(); command
        case YT.PlayerState.UNSTARTED:
        // (paused) -- what happens when the user pauses the video, or scrubs the playhead (we don't stop the rabbit syncronizer because we want the rabbit to continue updating if the user scrubs the playhead while the video is paused)
        case YT.PlayerState.PAUSED:
            yt_stopRabbitAndSliderSyncronizer();
            setPlayPauseButtonsClass(_playButtonClass);            
            break;
        // (cued) -- also happens when video is "stopped" by the player.stopVideo(); command (which we send when the ride is removed from the map)
        case YT.PlayerState.CUED:
            setPlayPauseButtonsClass(_playButtonClass);              
            // yt_stopRabbitAndSliderSyncronizer();

            // DURATION IS 0 IN THE CUED STATE
            // update SLIDER            
            const vCurrentTime = _player.getCurrentTime();
            yt_updateSliderFromVideoTime(vCurrentTime);            
            updateUIElementsFromVideoTime(vCurrentTime);

            
            _playbackRateIndex = _defaultPlaybackRateIndex;
            _player.setPlaybackRate(_playbackRatesArray[_playbackRateIndex]);
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






// ################## PRIVATE UI UPDATE METHODS ##################
// ################## PRIVATE UI UPDATE METHODS ##################
// ################## PRIVATE UI UPDATE METHODS ##################

// stops the currently running interval timer who's ID is stored in "_rabbitAndSliderSyncTimerID"
function yt_stopRabbitAndSliderSyncronizer(){
    
    if(_rabbitAndSliderSyncTimerID !== undefined){
        (_consoleLogsOn === true) ? console.log("STOP - interval timer") : undefined;
        // garbage collection
        clearInterval(_rabbitAndSliderSyncTimerID);
    
        // this lets our "startRabbitAndSliderSyncronizer()" function know we need a new one
        _rabbitAndSliderSyncTimerID = undefined;
    }
}


// starts an interval timer that updates the rabbit's position every "rabbitAndSliderSyncInterval" milliseconds
function startRabbitAndSliderSyncronizer() {
    
    // this "if" statement prevents us from generating additional interval timers in the case that we already have one running
    // we want to be careful not to generate more than one due to the way garbage collection works with these timers
    // we just have to make sure that everytime we call clearInterval(ID) we need to set "_rabbitAndSliderSyncTimerID" to undefined
    if(_rabbitAndSliderSyncTimerID === undefined){
        (_consoleLogsOn === true) ? console.log("START - interval timer") : undefined;
        
        _rabbitAndSliderSyncTimerID = window.setInterval( function (){
            //sync UI elements to current time of the playhead (a float that is accurate to many milliseconds)
            const vCurrentTime = _player.getCurrentTime();
            updateUIElementsFromVideoTime(vCurrentTime);
            yt_updateSliderFromVideoTime(vCurrentTime);
            
            
        }, _rabbitAndSliderSyncInterval);
    }

}



// this is how we move the rabbit around the map
// we get the frame index of the video, 
// and send that back to the display update logic
function updateUIElementsFromVideoTime(time){
    
    // we only want to update the rabbit and ride stats if "showRabbitOnRoute" is true
    if(showRabbitOnRoute){

        const frameIndex = yt_getFrameIndexFromVideoTime(time);

        syncRabbitMarkerToVideo("frameIndex", frameIndex);
        syncCumulativeRideStatsToVideo("frameIndex", frameIndex);

    }

}


function yt_updateSliderFromVideoTime(vTime){

    const vCurrentTime = (vTime) ? vTime : _player.getCurrentTime();

    if(sliderAvailable){        
        //current time of the playhead (a float that is accurate to many milliseconds)
        const vDuration = _player.getDuration();
        // console.log("updating  slider");
        // duration only is reported once the video starts playing
        // if the video has just been cued, the duration will return 0
        // we need to avoid divide by 0 so we add some extra safeguards here
        const vPercentWatched = (vDuration !== 0) ? vCurrentTime/vDuration : 0.0;
        slider.value = vPercentWatched*100;
    }
}






function setPlayPauseButtonsClass(buttonClassToAdd){

    let buttonClassToRemove = (buttonClassToAdd === _playButtonClass) ? _pauseButtonClass : _playButtonClass;

    // if the buttonClassToAdd doesn't match either of our button classes log the error and return
    if(![_pauseButtonClass, _playButtonClass].includes(buttonClassToAdd)){        
        console.log("button class not recognized");
        return;
    }

    playPauseButtonList.forEach( (button, i) => {
        button.classList.remove(buttonClassToRemove);
        button.classList.add(buttonClassToAdd);    
    });


    // we will run this functionality once and only if we have initialized the rabbit popup content
    // first we check to see if the "_pauseButtonClass" is the one being set (this means the play button was pressed)
    // then we make sure this is a bikeLapse route thanks to "showRabbitOnRoute"
    // and lastly we make sure that the "showRabbitIntroPopupMessage" is set to true (meaning we've initialized our rabbit popup)
    if(buttonClassToAdd === _pauseButtonClass && showRabbitOnRoute && showRabbitIntroPopupMessage){

        setRabbitPopupContentToPlayPauseButton(pressPlay = true);
    }


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
    
    if(button.classList.contains(_playButtonClass)){
        _player.playVideo();
    }
    else if(button.classList.contains(_pauseButtonClass)){
        _player.pauseVideo();
    }
    else if(button === stopButton){
        _player.stopVideo();

    }

}

function yt_addPlayPauseButton(button){

    const playerState = _player.getPlayerState();
    
    switch(playerState){
        case YT.PlayerState.PLAYING:
        case YT.PlayerState.BUFFERING:
            button.classList.add(_pauseButtonClass);
            break;
        case YT.PlayerState.ENDED:
        case YT.PlayerState.UNSTARTED:  
        case YT.PlayerState.PAUSED:
        case YT.PlayerState.CUED:
            button.classList.add(_playButtonClass);
            break;
        default:
            break;

    }

    button.onclick = videoTransportButtonsHandler;

    playPauseButtonList.push(button);
}


// "onchange" callback is triggered when we release the slider
// at which point we want to seek the video playhead to the placement of the slider
// and we can allow the slider to continue being updated by the YouTube player again
slider.onchange = function(event){
    // console.log("slider on change");
    const sliderValue = event.target.value;
    const vDuration = _player.getDuration();

    // the second argument tells the video to keep playing from the new position in the case that it was already playing before we told it to seek
    const vTimeToSeekTo = vDuration*sliderValue/100;

    // eventually we should call "yt_stopRabbitAndSliderSyncronizer();" when the video is paused
    // in which case we will need to update the cumulative stats and rabbit 
    // when we move the slider and the video is paused
    updateUIElementsFromVideoTime(vTimeToSeekTo);

    
    _player.seekTo(vTimeToSeekTo, true);
    

    sliderAvailable = true;
}

// "oninput" callback is triggered when we grab the slider and slide it around
// when the user is moving the slider around, we don't want its position
// to be updated with the playhead of the video, so we set "sliderAvailable" to false
// it is always called before "onchange"
slider.oninput = function(event){
    sliderAvailable = false;
}


// PLAYBACK RATE BUTTON HANDLER SETUP
if(playbackRateButton !== null){
    playbackRateButton.onclick = playbackButtonHandler;
}

// when the playback-button is pressed, we want to cycle through the playback options
// as defined in the _playbackRatesArray
function playbackButtonHandler(event){

    // increment the _playbackRateIndex and 
    // if it is greater than or equal to the length of the _playbackRatesArray
    // we should reset it to 0, otherwise just use the newly incremented value
    _playbackRateIndex = ((_playbackRateIndex += 1) >= _playbackRatesArray.length) ?
                                 0 : _playbackRateIndex;

    // grab the playback rate specified at that index in the _playbackRatesArray
    const newPlaybackRate = _playbackRatesArray[_playbackRateIndex];
    
    // if the newPlaybackRate is one of the available rates, set the playbackRate to the new rate
    if(_player.getAvailablePlaybackRates().includes(newPlaybackRate)){
        _player.setPlaybackRate(newPlaybackRate);
    }
    // if the newPlaybackRate is NOT one of the available rates, 
    // recursively call our function to do it all again until we find one that works
    // worst case we land back at 1.0 and the button appears to do nothing
    else{        
        console.log(`playback rate "${newPlaybackRate}" not allowed`);
        console.log(`Available playback rates are: ${_player.getAvailablePlaybackRates()}`);
        playbackButtonHandler();
    }
}