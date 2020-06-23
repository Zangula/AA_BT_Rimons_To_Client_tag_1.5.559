import {
    Device,
} from 'react-native-ble-plx';
import {
    arrayBufferToBase64,
    convertBase64ToBinary,
} from 'bt-app/Utils/base64'
import {
    parseTimeWithSec,
    parseTime,
    bitArrayToByte,
    intToByteArray,
} from 'bt-app/Utils/conversion';

//GEFEN - REMON = HOSEND
export const UUID_GRH_Mapping = {
    irregation: {
        service: "e8680100-9c4b-11e4-b5f7-0002a5d5c51b",
        characteristic: {
            program: "e8680101-9c4b-11e4-b5f7-0002a5d5c51b",
            status: "e8680102-9c4b-11e4-b5f7-0002a5d5c51b",
            control: "e8680103-9c4b-11e4-b5f7-0002a5d5c51b"
        }
    },
    time_date: {
        service: "e8680200-9c4b-11e4-b5f7-0002a5d5c51b",
        characteristic: {
            HEART: "e8680201-9c4b-11e4-b5f7-0002a5d5c51b",
            gal_TD: "e8680202-9c4b-11e4-b5f7-0002a5d5c51b",
            set_TD: "e8680203-9c4b-11e4-b5f7-0002a5d5c51b"
        }
    },
    authorization: {
        service: "e8680400-9c4b-11e4-b5f7-0002a5d5c51b",
        characteristic: {
            password: "e8680401-9c4b-11e4-b5f7-0002a5d5c51b",
        }
    }
}

export const UUID_TAMAR_Mapping = {
    irregation: {
        service: "20900100-bdee-493a-aa74-a8137c9d43f0",
        characteristic: {
            program: "20900101-bdee-493a-aa74-a8137c9d43f0",
            status: "20900102-bdee-493a-aa74-a8137c9d43f0",
            control: "20900103-bdee-493a-aa74-a8137c9d43f0"
        }
    },
    time_date: {
        service: "20900100-bdee-493a-aa74-a8137c9d43f0",
        characteristic: {
            HEART: "20900106-bdee-493a-aa74-a8137c9d43f0",
            gal_TD: "20900104-bdee-493a-aa74-a8137c9d43f0",
            set_TD: "20900104-bdee-493a-aa74-a8137c9d43f0",
        }
    },
    authorization: {
        service: "20900100-bdee-493a-aa74-a8137c9d43f0",
        characteristic: {
            password: "20900105-bdee-493a-aa74-a8137c9d43f0",
        }
    }
}

export const MODELS = {
    GEFEN: {
        models: ['11000'],
        name: 'GEFEN',
        status_bytes: 7,
        program_bytes: 20,
        control_bytes: 7,
        UUIDMapping: UUID_GRH_Mapping,
        nameMapping: {
            GL11000: "11000-BT"
        },
    },
    HOSEND: {
        models:['9001'],
        name: 'HOSEND',
        status_bytes: 7,
        program_bytes: 20,
        control_bytes: 7,
        UUIDMapping: UUID_GRH_Mapping,
        nameMapping: {
            GL9001: "9001-BT"
        },
    },
    RIMON: {
        models: ['7001'],
        name: 'RIMON',
        status_bytes: 7,
        program_bytes: 20,
        control_bytes: 7,
        UUIDMapping: UUID_GRH_Mapping,
        nameMapping: {
            GL7001: "7001-BT"
        },
    },
    TAMAR: {
        models: ['6100', '6200','8000'],
        name: 'TAMAR',
        status_bytes: 20,
        program_bytes: 20,
        control_bytes: 20,
        UUIDMapping: UUID_TAMAR_Mapping,
        nameMapping: {
            GL6100: "DC -BT",
            GL6200: "DC– BT (GB)",
            GL6200F: "DC – 11F",
            GL8000B: "AC – BT",
            GL8000G: "AC– BT (GB)",
        },
    },
}

export const SUPPORTED_MODELS = [...MODELS.GEFEN.models, ...MODELS.HOSEND.models, ...MODELS.RIMON.models, ...MODELS.TAMAR.models]

class DeviceFamily {

    device: Device

    constructor(device) {
        this.device = device
    }

    get family() {
        if(MODELS.GEFEN.models.includes(this.modelNumber)){
            return MODELS.GEFEN
        }
        if(MODELS.HOSEND.models.includes(this.modelNumber)){
            return MODELS.HOSEND
        }
        if(MODELS.RIMON.models.includes(this.modelNumber)){
            return MODELS.RIMON
        }
        if(MODELS.TAMAR.models.includes(this.modelNumber)){
            return MODELS.TAMAR
        }
        return MODELS.TAMAR // due to testing device that dont have correct family
    }

    get familyName(){
        return this.family.name
    }

    get modelName() {
        return String((this.device.localName || "").split("-")[0]).replace("GL", "")
    }

    get modelNumber(){
        return this.modelName.replace(/\D+/g, "")
    }

    statusPulse(){
        if(['GEFEN','RIMON', 'HOSEND'].includes(this.familyName)){
            return "//8="
        }

        if(['TAMAR'].includes(this.familyName)){
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

    get serialNumber() {
        return String( (this.device.localName || "").split("-")[1] || "N/A" )
    }

    get simplifiedModel() {
        if(['GEFEN','RIMON', 'HOSEND'].includes(this.familyName)){
            return `GL${this.modelNumber}`
        }
        if(['TAMAR'].includes(this.familyName)){
            return String((this.device.localName || "").split("-")[0])
        }
    }
    get nameMapping() {
        if(['GEFEN','RIMON', 'HOSEND'].includes(this.familyName)){
            return this.family.nameMapping[this.simplifiedModel] || "GL"
        }
        if(['TAMAR'].includes(this.familyName)){
            return this.family.nameMapping[this.simplifiedModel] || "GL"
        }
    }

    
    get isGalconTimer() {
        if (this.device.localName == "GL") { return true } // due to testing device that dont have correct family
        return (SUPPORTED_MODELS.indexOf(this.modelNumber) > -1)
    }


}

export default DeviceFamily