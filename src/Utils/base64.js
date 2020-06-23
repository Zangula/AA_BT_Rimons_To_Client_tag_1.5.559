// @flow
// Inspired by: https://github.com/davidchambers/Base64.js/blob/master/base64.js
import {logError} from './logger'
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const  btoa = (input:string = '')  => {
    let str = (input || '');
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3/4);

      if (charCode > 0xFF) {
        logError({ message: "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."});
      }

      block = block << 8 | charCode;
    }

    return output;
}

export const  atob = (input:string = '') => {
    let str = (input || '').replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      logError({message: "'atob' failed: The string to be decoded is not correctly encoded."});
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  }
  
  export const convertBase64ToBinary = (base64: string) => {
    let raw = atob(base64);
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));
  
    for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  export const  arrayBufferToBase64 =( buffer ) =>{
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
}