import { atob, btoa } from './base64'
export const bytesToString = (bytes) => {
    return bytes.map(function (x) { return String.fromCharCode(x) }).join('')
}

export const stringToBytes = (str) => {
    return str.split('').map(function (x) { return x.charCodeAt(0) })
}

export const bytesToArray = (buffer) => {
    return new Uint8Array(buffer);
}

export const parseTime = (hh=0, mm=0): string => {
    if (hh == null || mm == null) {
        return '';
    }
    if (hh > 9) {
        hh = String(hh);
    } else {
        hh = '0' + String(hh);
    }
    if (mm > 9) {
        mm = String(mm);
    } else {
        mm = '0' + String(mm);
    }

    return hh + ':' + mm;
}

export const parseTimeString = (str): string => {
    const res = str.split(':');
    let hh = parseInt(res[0]);
    let mm = parseInt(res[1]);
    let hhStr: string;
    let mmStr: string;
    if (hh > 9) {
        hhStr = String(hh);
    } else {
        hhStr = '0' + String(hh);
    }
    if (mm > 9) {
        mmStr = String(mm);
    } else {
        mmStr = '0' + String(mm);
    }

    return hhStr + ':' + mmStr;
}

export const parseTimeWithSec = (hh, mm, ss=0): string => {
    if (ss > 9) {
        ss = String(ss);
    } else {
        ss = '0' + String(ss);
    }
    return parseTime(hh, mm) + ":" + ss;
}

export const intToByteArray = (num): any[] => {
    var b = [];
    for (var i = 0; i < 8; i++)
        b[i] = (num >> i) & 1;
    return b;
}

export const bitArrayToByte = (arrOfBits): number => {
    if (!arrOfBits) return 0;
    let result = 0;
    for (let i = 0; i < arrOfBits.length; i++) {
        const bit = arrOfBits[i];
        result += bit * Math.pow(2, i);
    }
    return result;
}


