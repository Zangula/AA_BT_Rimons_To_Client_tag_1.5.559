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

class StatusModal {
    isOpen: boolean;
    isMasterOpen: boolean;
    isMasterShorted: boolean;
    isFertilizerOpen: boolean;
    isSensorWet: boolean;
    isCyclicSupported: boolean;
    waterBudget: number = 0;
    isWeeklySupported: boolean;
    isRainSensorSupported: boolean;
    sensorType: string;
    openFaucets: { valve: number; hh_left: number; mm_left: number;  ss_left: number }[] = [];
    faucets: {isShorted: boolean, inQueue: boolean, name: string , number: number}[] = [] ;
    swVersion: number;
    rainOff: number;
    valvesNumber: number;
    useProgramDuration: boolean = true;
    type: "Simple" | "Professional" | "Simple-11F" | "Professional-11F";
    inputVolts: number = 9;
    batteryLevel: number = 100;
    isBatteryLow: boolean;
    inputCurrentType: string;
    powerWattage: number = 0;
    bleRSSI: number = 0;
    seasonalAdjustmentSupported: boolean = false;
    
    constructor(base64Input) {
        const props = convertBase64ToBinary(base64Input)
        this.tmpBytes = props
        if (props.length == 20) {
            this.sensorType = "TAMAR";
            this.isCyclicSupported = true
            this.isWeeklySupported = true
            this.isRainSensorSupported = true;
            let bit = [intToByteArray(props[0]), intToByteArray(props[8])]; //#1st byte, 9th Byte
            this.openFaucets = []
            // 2nd to 7th byte
            for (const [i, num] of [bitArrayToByte(bit[0].slice(0, 4)), bitArrayToByte(bit[0].slice(4, 8))].entries()) { // LSB and MSB number it specify LSB(0,15), MSB(0,15) (min,max)
                this.openFaucets.push({
                    valve: num == 15 ? num : num + 1,  // 15 == 0xFF -> no Valve, 0x0…0xB – valves # 1 to 12 [ 13 == 0xC – pre-Fert]
                    hh_left: props[1 + (i*3)], // 2,5 th byte (1,4)
                    mm_left: props[2 + (i*3)], // 3,6 th byte (2,5)
                    ss_left: props[3 + (i*3)], // 4,7 th byte (3,6)
                    openedFrom: bit[1][i+6] == 1 ? "MANUAL" : "PROGRAM", // 9th byte( 7th, 8th defines manual/propgram 1== manual)
                })
            }
            bit = intToByteArray(props[8]); //#9th byte
            this.isOpen = (this.openFaucets[0].valve < 15 || this.openFaucets[1].valve < 15)  // is open by program

            bit = intToByteArray(props[9]); //#10th byte
            this.isSensorWet = bit[0] == 1
            this.isMasterOpen = bit[1] == 1
            this.isFertilizerOpen = bit[2] == 1
            bit = intToByteArray(props[1]);
            this.batteryLevel = (String(props[10]) +":"+ String(props[11]))  // 11th and 12th byte
            this.isBatteryLow = this.batteryLevel <= 20 ? true : false;
            this.rainOff = props[12];  // 13th byte
            bit = intToByteArray(props[13]) // Jumpers table 14th byte
            const jumperConf = `${bit[0]}${bit[1]}${bit[2]}`
            this.valvesNumber = {
                '000': 0,
                '100': 1,
                '010': 2,
                '110': 4,
                '001': 6,
                '101': 9,
                '011': 12,
                '111': 12,
            }[jumperConf]
            this.inputCurrentType = bit[3] == 1 ? 'DC' : 'AC'
            this.type = `${bit[4] == 1 ? 'Simple' : 'Professional'}${jumperConf == '111' ? '-11F' : ''}`
            //bit[6] Bluetooh config is not required

            this.swVersion = props[14]; // 15th byte
            this.bleRSSI = props[15] //16th byte between signal strength not needed
            this.waterBudget = props[16] // 17th byte between (10 -- 190) percent
            this.inputVolts = bit[6] == 1 ? 18 : 9
            this.powerWattage = bit[7] == 1 ? 3 : 2
            this.faucets = []
            const queues = [...intToByteArray(props[7]), ...intToByteArray(props[8])]  // 8th 9th defines  valve queues
            const shorted = [...intToByteArray(props[17]), ...intToByteArray(props[18])]  // 18th 19th defines shorted valve
            for (let i = 0; i < this.valvesNumber; i++) {
                this.faucets.push({
                    number: i + 1,
                    inQueue: queues[i] == 1,
                    isShorted: shorted[i + 1] == 1
                })
            }
            this.isMasterShorted = shorted[0] == 1
            this.seasonalAdjustmentSupported = true
            // props[19] 20th byte is spare
        }

        if (props.length == 7) {
            let bit = intToByteArray(props[0]);
            this.isOpen = bit[0] ? true : false;
            this.isSensorWet = bit[1] ? true : false;
            this.isBatteryLow = bit[2] ? true : false;
            this.isCyclicSupported = bit[3] ? true : false;
            this.isWeeklySupported = bit[4] ? true : false;
            this.isRainSensorSupported = bit[5] ? true : false;

            if (bit[6] && bit[7])
                this.sensorType = "GEFEN";
            else if (bit[6])
                this.sensorType = "RIMON";
            else if (bit[7])
                this.sensorType = "HOSEND";

            bit = intToByteArray(props[1]);
            
            this.openFaucets =[{
                valve: 1,
                hh_left: props[2],
                mm_left: props[3],
                ss_left: props[4],
                openedFrom: this.isOpen ? ( bit[0] == 1 ? "MANUAL" : "PROGRAM") : "",
            }]
            this.valvesNumber = 1
            // START Fake valvees here
            // this.isCyclicSupported = true
            // this.valvesNumber = 6
            // END Fake valvees here

            this.faucets = []
            for (let i = 0; i < this.valvesNumber; i++) {
                this.faucets.push({
                    number: i+1,
                    inQueue: false,
                    isShorted: false,
                })
            }

            this.swVersion = props[5];
            this.rainOff = props[6];
            
            this.type = 'Simple'
            this.inputVolts = 9
            this.inputCurrentType = 'DC'
            this.seasonalAdjustmentSupported = false
        }
        
    }



    get timeLeftStr(): string {
        return parseTimeWithSec(this.hh_left, this.mm_left, this.ss_left);
    }

    savableStatus(): object{
        return({
            useProgramDuration: this.useProgramDuration,
            isOpen: this.isOpen,
            isMasterOpen: this.isMasterOpen,
            isMasterShorted: this.isMasterShorted,
            isFertilizerOpen: this.isFertilizerOpen,
            isSensorWet: this.isSensorWet,
            isBatteryLow: this.isBatteryLow,
            isCyclicSupported: this.isCyclicSupported,
            isWeeklySupported: this.isWeeklySupported,
            isSensorSupported: this.isSensorSupported,
            sensorType: this.sensorType,
            batteryLevel: this.batteryLevel,
            openFaucets: this.openFaucets,
            faucets: this.faucets,
            swVersion: this.swVersion,
            rainOff: this.rainOff,
            valvesNumber: this.valvesNumber,
            inputVolts: this.inputVolts,
            inputCurrentType: this.inputCurrentType,
            type: this.type,
            waterBudget: this.waterBudget,
            seasonalAdjustmentSupported: this.seasonalAdjustmentSupported,
            isRainSensorSupported: this.isRainSensorSupported,
            isDurationSecondsSupported: this.isDurationSecondsSupported,
        })
    }
    get isDurationSecondsSupported(): boolean{
        if (this.sensorType == "TAMAR") {
            return this.type.includes("Professional")
        }
        if (['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            return false
        }
        return false
    }
    bytes() {
        let arr = []
        if (this.sensorType == "TAMAR") {
            arr = new Uint8Array(20);
            arr[0] = bitArrayToByte([
                ...intToByteArray(this.openFaucets[0].valve).splice(0, 4),
                ...intToByteArray(this.openFaucets[1].valve).splice(0, 4)
            ])
  
           
            for (const [i, faucet] of this.openFaucets.entries()) {
                arr[1 + (i*3)] = faucet.hh_left
                arr[2 + (i*3)] = faucet.hh_left
                arr[3 + (i*3)] = faucet.hh_left
            }

            let bit = new Uint8Array(8); //#10th byte
            bit[0] = this.isSensorWet ? 1 : 0
            bit[1] = this.isMasterOpen ? 1 : 0
            bit[2] = this.isFertilizerOpen ? 1 : 0
            arr[9] = bitArrayToByte(bit)
           


            arr[10] = parseInt(this.batteryLevel.split(":")[0])
            arr[11] = parseInt(this.batteryLevel.split(":")[1])
            arr[12] = this.rainOff // 13th byte
            
            bit = new Uint8Array(8); // Jumpers table 14th byte
            let jumperConf = {
                0: '000',
                1: '100',
                2: '010',
                4: '110',
                6: '001',
                9: '101',
                12: '011',
            };
            jumperConf = String(jumperConf[this.valvesNumber])
            if (this.type.split("-")[1] == '11F') {
                jumperConf = '111'
            }
            [bit[0], bit[1], bit[2]] = jumperConf.split("").map( i => parseInt(i) )
            bit[3] = this.inputCurrentType == 'DC' ? 1 : 0
               
            bit[4] == this.type.split("-")[1] == 'Simple' ? 1 : 0
            bit[6] = 1 //Bluetooh enabled 
            bit[6] = this.inputVolts == 18 ? 1 : 0
            bit[7] = this.powerWattage == 3 ? 1 : 0
            arr[13] = bitArrayToByte(bit)


            arr[14] = this.swVersion; // 15th byte
            arr[15] = this.bleRSSI //16th byte between signal strength not needed
            arr[16] = this.waterBudget// 17th byte between (10 -- 190) percent
            
            bit = [new Uint8Array(8), new Uint8Array(8), new Uint8Array(8), new Uint8Array(8)]
            
            for (let i = 0; i < this.valvesNumber ; i++) {
                if(i<7){
                    bit[0][i] = this.faucets[i].inQueue ? 1 : 0
                }
                if(i> 0 &&i<7){
                    bit[2][i] = this.faucets[i-1].isShorted ? 1 : 0 
                }
                if(i> 7 &&i<12){
                    bit[1][i-8] = this.faucets[i].inQueue ? 1 : 0
                    bit[3][i-8] = this.faucets[i].isShorted ? 1 : 0
                }
    
            }

            arr[8][6] = this.openFaucets[0].openedFrom == "MANUAL" ?  1 : 0 //#9th byte  is open by program
            arr[8][7] =this.openFaucets[1].openedFrom == "MANUAL" ?  1 : 0
            arr[17][0] = this.isMasterShorted  ? 1 : 0
            [arr[7], arr[8], arr[17], arr[18]] = [bitArrayToByte(bit[0]), bitArrayToByte(bit[1]), bitArrayToByte(bit[2]), bitArrayToByte(bit[3])]
        }

        if (['GEFEN', 'RIMON', 'HOSEND'].indexOf(this.sensorType) > -1) {
            arr = new Uint8Array(7);
            let bit = new Uint8Array(8);

            bit[0] = this.isOpen ? 0 : 1;
            
            arr[0] = bitArrayToByte(bit);

            bit = new Uint8Array(8);
            if(this.openFaucets[0].openedFrom == "MANUAL"){
                bit[0] = this.isOpen ?  1 : 0
            }
            bit[1] = this.useProgramDuration ? 0 : 1;
            arr[1] = bitArrayToByte(bit);

            bit = new Uint8Array(8);

            bit[0] = this.rainOff == 0 ? 0 : 1;
            bit[1] = this.rainOff == 0 ? 1 : 0;

            arr[2] = bitArrayToByte(bit);

            arr[3] = this.openFaucets[0].hh_left;
            arr[4] = this.openFaucets[0].mm_left;
            arr[5] = this.openFaucets[0].ss_left;

            arr[6] = this.rainOff;
        }



        return arr
    }

    get buffer() {
        return this.bytes().buffer;
    }

    get totalBytes() {
        return this.bytes().length
    }

    base64() {
        return arrayBufferToBase64(this.buffer)
    }

    binary() {
        let arr = []
        this.bytes().map(int => arr.push(`${intToByteArray(int)}`))
        return arr.join(" ")
    }


    pretty() {
        return {
            size: `${this.totalBytes}`,
            sensorType: `${this.sensorType}`,
            type: `${this.type}`,
            'input/consumption': `${this.inputVolts}V ${this.inputCurrentType} / ${this.powerWattage}W`,
            battery: `${this.batteryLevel}(${this.isBatteryLow})`,
            waterBudget: `${this.waterBudget}`,
            valvesNumber: `${this.valvesNumber}`,
            isOpen: `${this.isOpen}`,
            isMasterOpen: `${this.isMasterOpen}`,
            isMasterShorted: `${this.isMasterShorted}`,
            isFertilizerOpen: `${this.isFertilizerOpen}`,
            rainOff: `${this.rainOff}`,
            isSensorWet: `${this.isSensorWet}`,
            isCyclicSupported: `${this.isCyclicSupported}`,
            isWeeklySupported: `${this.isWeeklySupported}`,
            openFaucets: (this.valvesNumber == 1 ? [`${this.hh_left}:${this.mm_left}:${this.ss_left}`] : this.openFaucets),
            faucets: this.faucets,
            swVersion: `${this.swVersion}`,
            useProgramDuration: `${this.useProgramDuration}`,
            isRainSensorSupported: `${this.isRainSensorSupported}`,
            seasonalAdjustmentSupported: `${this.seasonalAdjustmentSupported}`,
            base64: `${this.base64()}`,
            bytes: `${this.bytes()}`,
            binary: `${this.binary()}`,
        }
    }
}

export default StatusModal