const VERSION = {
    0: "MPEG Version 2",
    1: "MPEG Version 1"
};

const LAYER = {
    0: "reserved",
    1 : "layer 3",
    2 : "layer 2",
    3 : "layer 1"
};

const BITRATE = {
    0: "free",
    1: "32",
    2: "40",
    3: "48",
    4: "56",
    5: "64",
    6: "80",
    7: "96",
    8: "112",
    9: "128",
    10: "160",
    11: "192",
    12: "224",
    13: "256",
    14: "320",
    15: "bad",
};

const FREQUENCY = {
    0: "44100",
    1: "48000",
    2: "32000",
    3: "reserved"
};

const CHANNEL = {
    0: "Stero",
    1: "Joint Stero",
    2: "Dual",
    3: "Mono"
};

const PADDING = {
    0: "0",
    1: "1"
};


class mp3{

    constructor(int8View){
        this.int8View = int8View;

        /* 
            contains multiple object entries 
            potential Frame
            {
                "index":{interger}
                "counter":{interger},
                "decimalString": {string}
            }
        */ 
        this.potentialFrame = {};
        this.potentialFrameCounter = 0;
   
        this.frameHeader = null;

        this.version = null;
        this.layer = null;
        this.bitRate = null;
        this.freq = null;
        this.channel = null;
        this.padding = null;

        this.processMP3(this.int8View)
    }

    /**
     * 
     * @param {int8 typed array} int8View 
     */
     processMP3(int8View){

        let len = 100000;

        // for small typed arrays
        if(int8View.length < 100000){
            len = int8View.length;
        }


        for(let i=0; i < len; i++){
            
            if(int8View[i] == 255){

                if(int8View[i+1] != null && int8View[i+2] != null && int8View[i+3] != null){

                let hasMP3SyncWord = this.checkForMP3SyncWord(int8View[i+1]);
                
                    if(hasMP3SyncWord){
                    
                        let potentialFrameHeader = [int8View[i],int8View[i+1],int8View[i+2],int8View[i+3]]
                        let isValidFrameHeader = this.validateFrameString(potentialFrameHeader);

                        if(isValidFrameHeader){
                            this.addToPotentialFrame(potentialFrameHeader.toString(),i);
                        }
                    }
                }
            }
        }

        // getFrameWithHighestCount() returns object {decimalString,index}
        this.frameHeader = this.getFrameWithHighestCount(this.potentialFrame, this.potentialFrameCounter);
        this.setHeaderInfo((this.frameHeader["decimalString"]).split(",").map(item => parseInt(item)));
        this.printHeaderInfo();
    }

    getMP3Info(){
        return {
            "version":this.version,
            "layer":this.layer,
            "bit rate":this.bitRate,
            "freq":this.freq,
            "channel":this.channel,
            "padding":this.padding,
        }
    }

    /**
     * 
     * @param {int} decimalNumber2 
     *  check if decimalNumber2 has the first 4 bits set to 1  
     */
     checkForMP3SyncWord(decimalNumber2){

        if(decimalNumber2 === undefined){
            return false;
        }

        else{

            if((decimalNumber2 >> 4 & 0b00001111) === 15){
                return true
            }

            else{
                return false;

            }
        }
    }

    /*
        add to global variable 'potentialFrame' if 'decimalString' doesn't exist in the object
        if it does exits than increase count for 'decimalString' key by 1
    */
     addToPotentialFrame(decimalString,index){

        let isInFrameCouter = this.potentialFrame[decimalString];
        
        if(isInFrameCouter === undefined){
            this.potentialFrame[decimalString] = {"index":index,"counter":1,"decimalString":decimalString};
            this.potentialFrameCounter++;  
        }

        else{
            this.potentialFrame[decimalString]["counter"]++; 
        }
    }

    /**
     * 
     * @param {JSON object} potentialFrame 
     * @param {int} potentialFrameCounter 
     * returns object {decimalString,index}
     */
     getFrameWithHighestCount(potentialFrame, potentialFrameCounter){
        
        let objKey = Object.keys(potentialFrame);

        let highestCounter = potentialFrame[objKey[0]]["counter"]
        let decimalString = potentialFrame[objKey[0]] ["decimalString"];
        let index = potentialFrame[objKey[0]]["index"];

        if(potentialFrameCounter > 0){

            for(let i = 1;  i < potentialFrameCounter; i++){

                if (potentialFrame[objKey[i]]["counter"] > highestCounter){

                    highestCounter = potentialFrame[objKey[i]]["counter"];
                    decimalString = potentialFrame[objKey[i]] ["decimalString"];
                    index = potentialFrame[objKey[i]]["index"];
                }

            }

            return {decimalString,index};
        }

        else{
            return {decimalString,index};
        }
    }

    /**
     * 
     * @param { [int] } potentialFrameHeader 
     * potentialFrameHeader comes in as [255,251,178,100]
     */
     validateFrameString(potentialFrameHeader){

        let byte1 = potentialFrameHeader[0];
        let byte2 = potentialFrameHeader[1];
        let byte3 = potentialFrameHeader[2];
        let byte4 = potentialFrameHeader[3];

        let l_version = VERSION[byte2 >> 3 & 0b00000001];
        let l_layer = LAYER[byte2 >> 1 & 0b00000011];
        let l_bitRate = BITRATE[byte3 >> 4 & 0b00001111];
        let l_freq = FREQUENCY[byte3 >> 1 & 0b00000011];
        let l_padding = PADDING[byte3 >> 1 & 0b00000001];
        let l_channel = CHANNEL[byte4 >> 6 & 0b00000011];

        if(l_bitRate == BITRATE[15]){
            return false;
        }
        
        //if frequency 11
        else if(l_freq == FREQUENCY[3]){
            return false
        }

        else{
            return true;
        }

    }

    /**
     * 
     * @param { [int] } mp3Header 
     * mp3Header comes in as [255,251,178,100]
     */
     setHeaderInfo(mp3Header){

        // let byte1 = mp3Header[0];
        let byte2 = mp3Header[1];
        let byte3 = mp3Header[2];
        let byte4 = mp3Header[3];

        this.version = VERSION[byte2 >> 3 & 0b00000001];
        this.layer = LAYER[byte2 >> 1 & 0b00000011];
        this.bitRate = BITRATE[byte3 >> 4 & 0b00001111];
        this.freq = FREQUENCY[byte3 >> 1 & 0b00000011];
        this.padding = PADDING[byte3 >> 1 & 0b00000001];
        this.channel = CHANNEL[byte4 >> 6 & 0b00000011];
    }

    /* 
        decimalString {string} '225,55,23,91' => binaryString {string} "11111111111100101010100111100010"
        binaryString of 4 bytes
    */
     makeBinaryString(decimalString){
        let lst = decimalString.split(',');
        let binaryString = this.decimal2Binary(lst[0]) + this.decimal2Binary(lst[1]) + this.decimal2Binary(lst[2]) + this.decimal2Binary(lst[3]);
        return binaryString;
    }

     printHeaderInfo(){
        console.log("version: " + this.version);
        console.log("layer: " + this.layer);
        console.log("bitRate: " + this.bitRate);
        console.log("freq: " + this.freq);
        console.log("channel: " + this.channel);
        console.log("padding: " + this.padding);
    }

    /**
     * 
     * @param {int} start 
     * @param {int} end 
     */
    trimAudio(start,end){
        let frameSize = this.getFrameSize(this.bitRate,this.freq,this.padding);
        let index = this.frameHeader["index"];
        return this.sliceBuffer(start,end,this.int8View,frameSize,index);
    }

    sliceBuffer(start,end,int8View,frameSize,index){

        // let copy_int8View = new Uint8Array(int8View);
        // let beforeAudioData = copy_int8View.slice(0,index);

        start = index + frameSize*Math.floor(start/0.026);
        end = index + frameSize*Math.floor(end/0.026);

        // return int8View.slice(start,end)+beforeAudioData;
        return int8View.slice(start,end);
    }

    // returns x bytes 
     getFrameSize(bitRate,freq,padding){
        let frameSize = Math.floor(144* parseInt(bitRate)*1000/parseInt(freq)) + parseInt(padding);
        return frameSize;
    }
}