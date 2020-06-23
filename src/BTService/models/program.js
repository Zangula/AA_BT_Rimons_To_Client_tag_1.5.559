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
const JUMPER_TABLE = {
    "00": 'once',
    "01": 'minutes',
    "10": 'hours',
    "11": 'days',
}

class ProgramModel {
    valveNumber: number;
    sensorType: 'GEFEN'| 'RIMON'| 'HOSEND'| 'TAMAR';
    rainOffSensor: bolean = false;
    fertilizationPercent: number = 0;
    cyclicStartMM: number;
    cyclicStartHH: number;
    every: number;
    everyUnit: string;
    cycleWindow: {hh: number, mm: number}[] = [];
    startTimes: { isActive: boolean; hh: number; mm: number;  index: number }[];
    activeDayInWeek: any[];
    mm: number;
    hh: number;
    ss: number=0;
    cyclicStartIn: number;

    constructor({sensorType, valveNumber=1, base64}) {
        const props =  base64 ? convertBase64ToBinary(base64) :  new Uint8Array(20)
        this.sensorType = sensorType
        this.valveNumber = parseInt(valveNumber)
        if (['GEFEN', 'RIMON', 'HOSEND',"TAMAR"].indexOf(this.sensorType) == -1) {
            throw Error(`Program Model Initialization Failed: ${this.sensorType} not a valid sensor`)
        }

        if (['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            //***************Ammount*********
            this.hh = props[0];
            this.mm = props[1];
            //***********Day in Week**********
            this.activeDayInWeek = intToByteArray(props[2]);

            //***********Start Times**********
            this.startTimes = [];

            for (let i = 0; i < 4; i++) {
                let item: any = {};
                item.isActive = props[3 + (i * 2)] == 255 ? false : true;
                item.hh = props[3 + (i * 2)] == 255 ? 0 : props[3 + (i * 2)];
                item.mm = props[4 + (i * 2)] == 255 ? 0 : props[4 + (i * 2)];
                this.startTimes.push(item);
            }
            //***********Cyclic**********
            this.cyclicStartIn = props[11];
            this.cyclicStartHH = props[14];
            this.cyclicStartMM = props[15];
            this.everyUnit = props[12] > 0 ? 'days' : 'hours'
            this.every = this.everyUnit == 'days' ? props[12] :  props[13]
            this.cycleWindow = []
            this.rainOffSensor = false
            this.fertilizationPercent = 0
        }
        
        if (this.sensorType == "TAMAR") {
            this.valveNumber = props[0] || valveNumber ;
            this.hh = props[1];
            this.mm = props[2];
            this.ss = props[3];
            //***********Day in Week**********
            this.activeDayInWeek = intToByteArray(props[4]);

            //***********Start Times**********
            this.startTimes = [];
            if(this.activeDayInWeek[7] == 0){ // weekly
                this.startTimes = [];
                for (let i = 0; i < 4; i++) {
                    let item: any = {};
                    item.isActive = props[5 + (i * 2)] == 255 ? false : true;
                    item.hh = props[5 + (i * 2)] == 255 ? 0 : props[5 + (i * 2)];
                    item.mm = props[5 + (i * 2)] == 255 ? 0 : props[6 + (i * 2)];
                    this.startTimes.push(item);
                }
                this.cyclicStartHH = 0
                this.cyclicStartMM = 0;
                
                this.cycleWindow= [{hh:0, mm:0},{hh:0, mm: 0}]
                this.cyclicStartIn = 0;

                this.every = 0
                this.everyUnit = 'days'
            }

            //***********Cyclic**********
            if(this.activeDayInWeek[7] == 1){  // cyclic
                this.startTimes = [];
                this.cyclicStartHH = props[5];
                this.cyclicStartMM = props[6];
                this.cycleWindow= [
                    {
                        hh:props[7], 
                        mm:props[8]
                    },
                    {
                        hh:props[9], 
                        mm:props[10]
                    },
                ]
                this.cyclicStartIn = intToByteArray(props[13])
                this.cyclicStartIn[7] = 0 // ignore 7th bit
                this.cyclicStartIn = bitArrayToByte(this.cyclicStartIn)
                
                let bit = intToByteArray(props[14])
                const jumperConf = `${bit[7]}${bit[6]}`
                this.everyUnit = JUMPER_TABLE[jumperConf]
                bit = intToByteArray(props[14])
                bit[6] = 0
                bit[7] = 0
                this.every = bitArrayToByte(bit)
            }
            this.rainOffSensor = intToByteArray(props[13])[7] == 1
            this.fertilizationPercent = props[15]
        }        

    }

    
    get programType(): 'weekly' | 'cyclic' {
        if (['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            if ( this.every > 0 ) return 'cyclic';
            else return 'weekly';
        }
        if (this.sensorType == "TAMAR") {
           return this.activeDayInWeek[7] == 1 ? 'cyclic' : 'weekly'
        }

    }
    
    get startInUnit(): string {
        return 'days'
    }

    get buffer() {
        return this.bytes().buffer;
    }
    
    clearAllSettings(){
        this.activeDayInWeek = [0, 0, 0, 0, 0, 0, 0, 0]
        this.hh = 0
        this.ss = 0
        if (this.sensorType == "TAMAR") {
            this.mm = 2
            this.cycleWindow = [{hh:0, mm:0},{hh:0, mm: 0}]
        }
        if(['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            this.mm = 5
            this.cycleWindow = []
        }

        this.startTimes = [{ hh: 0, mm: 0, isActive: false }]
        this.every = 0
        this.cyclicStartIn = 0
        this.cyclicStartHH = 255
        this.cyclicStartMM = 255
        
    }
    savableProgram(){
        return({
            valveNumber: this.valveNumber,
            programType: this.programType,
            rainOffSensor: this.rainOffSensor,
            hh: this.hh,
            mm: this.mm,
            ss: this.ss,
            activeDayInWeek: this.activeDayInWeek,
            startTimes: this.startTimes,
            cycleWindow: this.cycleWindow,
            cyclicDaysLeft: this.cyclicDaysLeft,
           
            cyclicStartHH: this.cyclicStartHH,
            cyclicStartMM: this.cyclicStartMM,
            
            cyclicStartIn: this.cyclicStartIn,
            startInUnit: this.startInUnit,
            every: this.every,
            everyUnit: this.everyUnit,
            fertilizationPercent: this.fertilizationPercent
        })
    }

    validateWith(obj){
        let _program = {...obj}
        let errors = [] 
        
        this.hh = _program.hh
        this.mm = _program.mm
        this.ss = _program.ss
        _program.programType = _program.programType == 'cyclic' ?  'cyclic' : 'weekly' // default weekly

        this.startTimes = _program.startTimes.map(s =>{
            return({
                hh: s.hh,
                mm: s.mm,
                isActive: s.isActive,
            })
        })
            
        //this.startInUnit = _program.startInUnit
        //this.everyUnit = _program.everyUnit
        if(_program.programType == 'weekly'){
            if (this.sensorType == "TAMAR") {
                this.activeDayInWeek = [..._program.activeDayInWeek]
                this.activeDayInWeek[7] = 0
            }
            if(['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
                this.activeDayInWeek = [..._program.activeDayInWeek]
            }
            const hasAnyDay = this.activeDayInWeek.indexOf(1) > -1
            this.every = 0
            if( hasAnyDay && this.hh == 0 && this.mm == 0 && this.ss == 0 ){
                errors.push(
                    {valveNumber: this.valveNumber, type: 'DURATION_NOT_PRESENT'}
                )
            }
        
            if( hasAnyDay && !moment( `${this.hh}:${this.mm}:${this.ss}`, 'HH:mm:ss').isValid() ){
                errors.push(
                    {valveNumber: this.valveNumber, type: 'DURATION_INVALID'}
                )
            }
            const anyActiveTime = this.startTimes.findIndex(st =>  st.isActive == true ) > -1
            if(anyActiveTime == true && hasAnyDay == false){
                errors.push(
                    {valveNumber: this.valveNumber, type: 'DAY_NOT_PRESENT'}
                )
            }
        }else if(_program.programType == 'cyclic') {
            if (this.sensorType == "TAMAR") {
                this.activeDayInWeek = [0, 0, 0, 0, 0, 0, 0, 1]
            }
            if(['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
                this.every = _program.every
            }
            if( _program.every != 0 && this.hh == 0 && this.mm == 0  && this.ss == 0 ){
                errors.push(
                    {valveNumber: this.valveNumber, type: "DURATION_NOT_PRESENT"}
                )

            }
            if( _program.every != 0 && !moment( `${this.hh}:${this.mm}:${this.ss}`, 'HH:mm:ss').isValid() ){
                errors.push(
                    {valveNumber: this.valveNumber, type: "DURATION_INVALID"}
                )
            }
            if(_program.every == 0  ){
                errors.push(
                    {valveNumber: this.valveNumber, type: "EVERY_NOT_PRESENT"}
                )
                
            }
            
            this.every = _program.every
            this.everyUnit = _program.everyUnit
            if(_program.everyUnit == 'hours' && (this.hh*60*60 + this.mm*60 + this.ss ) > _program.every*60*60 ){
                errors.push(
                    {valveNumber: this.valveNumber, type:'DURATION_OUT_OF_RANGE', options: {count: this.every, range_unit: this.everyUnit} }
                )
            }
            this.cyclicStartHH = _program.cyclicStartHH
            this.cyclicStartMM = _program.cyclicStartMM
            
            if(this.every != 0 && !moment( `${this.cyclicStartHH}:${this.cyclicStartMM}`, 'HH:mm').isValid() ){
                errors.push(
                    {valveNumber: this.valveNumber, type: "CYCLIC_START_AT_NOT_PRESENT"}
                )
            }

        }else{
            errors.push(
                {valveNumber: this.valveNumber, type: 'PROGRAM_TYPE_INVALID'}
            )
        }
        this.cyclicStartIn = _program.cyclicStartIn
        
        
        this.rainOffSensor = _program.rainOffSensor
 
        if(_program.cycleWindow.length){
            this.cycleWindow = _program.cycleWindow
        }
        
        if(errors.length){
            return errors
        }
    }

    bytes() {
        let arr = new Uint8Array(20);
        if(['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            let bit = new Uint8Array(8);

            arr[0] = this.hh;
            arr[1] = this.mm;

            for (let i = 0; i < this.activeDayInWeek.length; i++) {
                bit[i] = this.activeDayInWeek[i];
            }
            arr[2] = bitArrayToByte(bit);

            for (var i = 0; i < 4; i++) {
                if (this.startTimes[i] && this.startTimes[i].isActive) {
                    arr[(i * 2) + 3] = this.startTimes[i].hh;
                    arr[(i * 2) + 4] = this.startTimes[i].mm;
                }
                else {
                    arr[(i * 2) + 3] = 0xFF;//Off
                    arr[(i * 2) + 4] = 0x00;
                }
            }

            arr[11] = this.cyclicStartIn;
            arr[12] = this.everyUnit == 'days' ? this.every : 0;
            arr[13] = this.everyUnit == 'hours' ? this.every : 0;
            arr[14] = this.cyclicStartHH;
            arr[15] = this.cyclicStartMM;
        }
        if (this.sensorType == "TAMAR") {
            arr[0] = this.valveNumber
            arr[1] = this.hh;
            arr[2] = this.mm;
            arr[3] = this.ss;

            let bit = new Uint8Array(8);

            for (let i = 0; i < this.activeDayInWeek.length; i++) {
                bit[i] = this.activeDayInWeek[i];
            }
            bit[7] =this.programType == 'cyclic' ? 1 : 0

            arr[4] = bitArrayToByte(bit);
            if(this.programType == 'weekly'){
                for (var i = 0; i < 4; i++) {
                    if (this.startTimes[i] && this.startTimes[i].isActive) {
                        arr[(i * 2) + 5] = this.startTimes[i].hh;
                        arr[(i * 2) + 6] = this.startTimes[i].mm;
                    }
                    else {
                        arr[(i * 2) + 5] = 0xFF;//Off
                        arr[(i * 2) + 6] = 0x00;
                    }
                }
                bit = intToByteArray(0);
                bit[7] = this.rainOffSensor ? 1 : 0
                arr[13] = bitArrayToByte(bit)
            }

            if(this.programType == 'cyclic'){
                arr[5] = this.cyclicStartHH
                arr[6] = this.cyclicStartMM
                
                for (var i = 0; i < 2; i++) {
                    arr[(i * 2) + 7] = this.cycleWindow[i].hh;
                    arr[(i * 2) + 8] = this.cycleWindow[i].mm;
                }
                //arr[11] = 0
                //arr[12] = 0
                bit = intToByteArray(this.cyclicStartIn);
                bit[7] = this.rainOffSensor ? 1 : 0
                arr[13] = bitArrayToByte(bit)
                
                let bit = intToByteArray(this.every)
                const jumperConf = Object.keys(JUMPER_TABLE).find(key => JUMPER_TABLE[key] === this.everyUnit);
                [bit[7], bit[6]] = String(jumperConf).split("").map( i => parseInt(i) )
                
                arr[14] = bitArrayToByte(bit)
            }

            arr[15] = this.fertilizationPercent

        }
        return arr
    }

    programPulse(){
        if(['GEFEN', 'RIMON', 'HOSEND'].includes(this.sensorType)){
            const arr = new Uint8Array(1)
            arr[0] = 255
            return arrayBufferToBase64(arr.buffer)
        }

        if(['TAMAR'].includes(this.sensorType)){
            const arr = new Uint8Array(2)
            let bit = new Uint8Array(8);
            bit[0] = 1
            bit[1] = 0
            arr[0] = bitArrayToByte(bit)
            arr[1] = this.valveNumber
            return arrayBufferToBase64(arr.buffer)
        }
        return "//8="
    }

    get totalBytes(){
        return this.bytes().length
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
            valveNumber: `${this.valveNumber}`,
            size: `${this.totalBytes}`,
            programType: `${this.programType}`,
            'hh:mm': `${this.hh}:${this.mm}:${this.ss}`,
            'cyclesLeft':  `${this.cyclicStartIn} ${this.startInUnit}`,
            'cyclic Frequency (D/H)':  `${this.every} ${this.everyUnit}`,
            'cyclic hh:mm': `${this.cyclicStartHH}:${this.cyclicStartMM}`,
            activeDayInWeek: `${this.activeDayInWeek}`,
            startTimes: `${this.startTimes.map(t => (t.isActive ? t.hh + ":" + t.mm : "OFF"))}`,
            cycleWindow: this.cycleWindow,
            base64: `${this.base64()}`,
            bytes: `${this.bytes()}`,
            binary: `${this.binary() }`,
            fertilizationPercent: this.fertilizationPercent,
            rainOffSensor: `${this.rainOffSensor}`,
        }
    }
}
export default ProgramModel
