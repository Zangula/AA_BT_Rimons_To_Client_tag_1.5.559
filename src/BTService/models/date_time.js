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
import moment from 'moment';
class DateTimeModel {
    sensorType: 'GEFEN'| 'RIMON'| 'HOSEND'| 'TAMAR';
    year: number;
    month: number;
    dayOfMonth: number;
    hrs: number;
    min: number;
    sec: number;
    dayOfWeek: number;

    constructor({sensorType, base64}) {
        const props = convertBase64ToBinary(base64)
        this.sensorType = sensorType
        if (['GEFEN', 'RIMON', 'HOSEND', 'TAMAR'].indexOf(this.sensorType) == -1) {
            throw Error(`Date Model Initialization Failed: ${this.sensorType} not a valid sensor`)
        }
        
        if(base64){
            this.year = String(props[0]) + String(props[1])
            this.month = props[2] ;
            this.dayOfMonth = props[3] ;
            this.hrs = props[4] ;
            this.min = props[5] ;
            this.sec = props[6] ;
            this.dayOfWeek = props[7];
        }
        if (!base64) {
            this.update(new Date());
            return;
        }
        
    }

    get buffer() {
        return this.bytes().buffer;
    }

    get isTimeInsync(){
        if(moment().day() !== this.dayOfWeek){
            return false
        }
        if(moment().hour() !==  this.hrs ){
            return false
        }
        if(moment().minute() !==  this.min ){
            return false
        }
        return true
    }
    datePulse(){
        if(['GEFEN'| 'RIMON'| 'HOSEND'| 'TAMAR'].includes(this.sensorType)){
            return "//8="
        }

        if(['TAMAR'].includes(this.sensorType)){
            return "//8="
        }
    }

    bytes(){
        let arr = new Uint8Array(8);

        arr[0] = parseInt(String(this.year)[0] + String(this.year)[1]);
        arr[1] = parseInt(String(this.year)[2] + String(this.year)[3]);
        arr[2] = this.month;
        arr[3] = this.dayOfMonth;
        arr[4] = this.hrs;
        arr[5] = this.min;
        arr[6] = this.sec;
        arr[7] = this.dayOfWeek;

        return arr
    }

    update(date: Date) {
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.dayOfMonth = date.getDate();
        this.hrs = date.getHours();
        this.min = date.getMinutes();
        this.sec = date.getSeconds();
        this.dayOfWeek = date.getDay();
    }

    base64() {
        return arrayBufferToBase64(this.buffer)
    }

    binary(){
        let arr = []
        this.bytes().map(int=> arr.push(`${intToByteArray(int)}`))
        return arr.join(" ") 

    }

    pretty() {
        return {
            size: `${this.bytes().length}`,
            'day/month/year': `${this.dayOfMonth}/${this.month}/${this.year}`, 
            'time': `${this.hrs}:${this.min}:${this.sec}`,
            dayOfWeek: `${this.dayOfWeek}`,
            base64: `${this.base64()}`,
            bytes: `${this.bytes()}`,
            binary: `${this.binary()}`,
        }
    }

}

export default DateTimeModel