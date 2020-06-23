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

class AuthorisationModel {
    code: array;
    MAX_LENGTH: number = 4;
    constructor() {
        this.code = new Uint8Array(4);
        this.code[0] = this.randomDigit()
        this.code[1] = this.randomDigit()
        this.code[2] = this.randomDigit()
        this.code[3] = this.randomDigit()
    }

    randomDigit(){
        return Math.floor(Math.random() * 10)
    }

    isValidCode(enteredCode){
        return Number( this.code.join("") ) == Number(enteredCode)
    }

    bytes(){
        return this.code
    }

    get buffer() {
        return this.bytes().buffer;
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
            code: `${this.code}`,
            base64: `${this.base64()}`,
            bytes: `${this.bytes()}`,
            binary: `${this.binary()}`,
        }
    }
}

export default AuthorisationModel