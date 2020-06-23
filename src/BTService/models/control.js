import {
    parseTimeWithSec,
    parseTime,
    bitArrayToByte,
    intToByteArray,
} from 'bt-app/Utils/conversion';
import {
    arrayBufferToBase64,
    convertBase64ToBinary,
} from 'bt-app/Utils/base64'


class ControlModel {
    sensorType: 'GEFEN'| 'RIMON'| 'HOSEND'| 'TAMAR';
    bytes: array;
    constructor({sensorType,base64}) {
        this.sensorType = sensorType
        if (['GEFEN', 'RIMON', 'HOSEND', 'TAMAR'].indexOf(this.sensorType) == -1) {
            throw Error(`Control Model Initialization Failed: ${this.sensorType} not a valid sensor`)
        }
        if(base64){
            const props = convertBase64ToBinary(base64)
            this.bytes = props
        }else{
            if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
                const props =  new Uint8Array(7);
                this.bytes = props
            }
            if ( 'TAMAR' == this.sensorType ) {
                const props =  new Uint8Array(20);
                this.bytes = props
            }
        }

    }
    
    setOpen(valve: number){
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            bit = new Uint8Array(8);
            bit[0] = 1 
            bit[1] = 1;
            this.bytes[1] = bitArrayToByte(bit);
        }
        if ( 'TAMAR' == this.sensorType) {
            let bit = intToByteArray(parseInt(valve))
            bit[7] = 1 
            this.bytes[1] = bitArrayToByte(bit)
        }
    }

    setClose(valve: number){
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            let bit = new Uint8Array(8);
            bit[0] = 1;
            this.bytes[0] = bitArrayToByte(bit);
            bit = new Uint8Array(8);
            bit[1] = 0;
            this.bytes[1] = bitArrayToByte(bit);
        }
        if ( 'TAMAR' == this.sensorType) { 
            this.bytes[0] = parseInt(valve)
        }
    }
    
    setDuration(hh,mm,ss){
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            this.bytes[3] = parseInt(hh)
            this.bytes[4] = parseInt(mm)
            this.bytes[5] = parseInt(ss)
        }
        if ( 'TAMAR' == this.sensorType) { 
            this.bytes[3] = parseInt(hh)
            this.bytes[4] = parseInt(mm)
            this.bytes[5] = parseInt(ss)
        }
    }

    setRainOff(days){
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            let bit = new Uint8Array(8);
            bit[0] = 1 
            bit[1] = 0
            this.bytes[2] = bitArrayToByte(bit);
            this.bytes[6] = parseInt(days)
        }
        if ( 'TAMAR' == this.sensorType) { 
            let bit = new Uint8Array(8);
            bit[0] = 1 
            bit[1] = 0
            this.bytes[2] = bitArrayToByte(bit);
            this.bytes[6] = parseInt(days)
        }

    }
    setWaterbudget(resolution: integer){ // 10% to 190%
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            throw Error("Water budget is not applicable for this sensor")
        }

        if ( 'TAMAR' == this.sensorType) { 
            let bit = new Uint8Array(8);
            bit[0] = 0 
            bit[1] = 1
            this.bytes[2] = bitArrayToByte(bit);
            this.bytes[7] = parseInt(resolution)
        }

    }

    clearRainOff(){
        if ( ['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType) ) {
            let bit = new Uint8Array(8);
            bit[0] = 0;
            bit[1] = 1;
            this.bytes[2] = bitArrayToByte(bit);
            this.bytes[6] = 0
        }
        if ( 'TAMAR' == this.sensorType) { 
            let bit = new Uint8Array(8);
            bit[0] = 1;
            bit[1] = 0;
            this.bytes[2] = bitArrayToByte(bit);
            this.bytes[6] = 0
        }
    }
    controlPulse(){
        if(['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType)){
            const arr = new Uint8Array(1)
            arr[0] = 255
            return arrayBufferToBase64(arr.buffer)
        }

        if(['TAMAR'].includes(this.sensorType)){
            const arr = new Uint8Array(2)
            let bit = new Uint8Array(8);
            bit[0] = 0
            bit[1] = 1
            arr[0] = bitArrayToByte(bit)
            arr[1] = 0
            return arrayBufferToBase64(arr.buffer)
        }
        return "//8="
    }

    get buffer() {
        return this.bytes.buffer;
    }



    base64() {
        return arrayBufferToBase64(this.buffer)
    }

    binary(){
        let arr = []
        this.bytes.map(int=> arr.push(`${intToByteArray(int)}`))
        return arr.join(" ") 
    }

    pretty() {
        return {
            size: `${this.bytes.length}`,
            base64: `${this.base64()}`,
            binary: `${this.binary() }`,
        }
    }

}

export default ControlModel