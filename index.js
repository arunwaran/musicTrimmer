var musicByteArray;
var downloadFileName;
var mp33;

window.onload = function(){
 document.getElementsByTagName("audio")[0].style.visibility = "hidden";
}

fileContainer.ondrop = (event) =>{
    loadFile();
}

function loadFile(){

    var fileItem = document.getElementById("fileDialog").files[0];
    downloadFileName = fileItem.name;

    var reader = new FileReader();

    reader.onload = (event) => {
        arrayBuffer = event.target.result;

        musicByteArray = new Uint8Array(arrayBuffer);
        let this_url = makeBlobURL(musicByteArray);

        var audio = document.getElementsByTagName("audio")[0];
        audio.src =  this_url;

        mp33 = new mp3(musicByteArray);
    }

    reader.readAsArrayBuffer(fileItem);
}

function playSong(value){
    let audio = document.getElementsByTagName("audio")[0];
    audio.play();
}

function pauseSong(value){
    let audio = document.getElementsByTagName("audio")[0];
    audio.pause();
}

function setValues(){
    let audio = document.getElementsByTagName("audio")[0];
    let audioDuration = Math.floor(audio.duration);
    
    
    document.getElementById("currentTime").innerText = 0;
    document.getElementById("startTime").value = 0;

    document.getElementById("fullTrackTime").innerText = audioDuration;
    document.getElementById("endTime").value = audioDuration;

    document.getElementById("trackRange").max = audioDuration
    document.getElementById("trackRange").max = audioDuration;
    document.getElementById("startTime").max = audioDuration;
    document.getElementById("endTime").max = audioDuration;
}

function updateTime(){
    let audio = document.getElementsByTagName("audio")[0];
    let currentTime = Math.floor(audio.currentTime);

    document.getElementById("currentTime").innerText = currentTime;

    let trackRange = document.getElementById("trackRange");
    trackRange.value = currentTime;
}

function trackRangeChange(){
    let trackRangeValue = document.getElementById("trackRange").value;
    document.getElementById("currentTime").innerText = trackRangeValue;

    let audio = document.getElementsByTagName("audio")[0];
    audio.currentTime = trackRangeValue;
}

function trimSong(){

    let maxValue = parseInt(document.getElementById("fullTrackTime").innerText);
    let startTime = parseInt(document.getElementById("startTime").value);
    let endTime = parseInt(document.getElementById("endTime").value);

    let validateRange = validateTrimRange(maxValue,startTime,endTime);

    if(validateRange){
        let uint8_Audio = mp33.trimAudio(startTime,endTime);
        let this_url = makeBlobURL(uint8_Audio);
        makeDownloadLink(this_url);
    }
    else{
        document.getElementById("userMessage").innerText = "Not a valid Range"
    }

}


function makeBlobURL(musicData){
    let blob = new Blob([musicData],{
        type: "application/byte-stream"
    })

    return window.URL.createObjectURL(blob);
}

function makeDownloadLink(musicURL){
    let a = document.createElement('a');
    a.innerText = "Download Me";
    a.href = musicURL;
    a.download = downloadFileName;
    document.getElementById("downloadContainer").appendChild(a);
}

function validateTrimRange(maxValue,startTime,endTime){
    let ifPass = true;

    if(endTime > maxValue){
        ifPass = false;
    }
    else if(startTime < 0){
        ifPass = false
    }
    else if(startTime >= endTime){
        ifPass = false
    }
    return ifPass;
}