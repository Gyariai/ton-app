import CryptoJS  from 'crypto-js';
import { Base64 } from 'js-base64';

const key = "9HNkypsYHy";

export const unit8encode = (data) => {
    const result = []

    data.forEach(value => {
        result.push(Base64.fromUint8Array(value))
    });
    
    return JSON.stringify(result)
}

export const unit8decode = (arr) => {
    const result = []
   
    const data = JSON.parse(arr)
    data.forEach(value => {
        result.push(Base64.toUint8Array(value))
    })

    return result
}

export const encryptAndSendMsg = async (msg) => {
    const u8s = Encode(msg)

    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(u8s), key).toString();

    return ciphertext
}

const Encode = (data) => {
    let res = {}
    let arr = Object.entries(data)

    for(let value of arr) {
        res[value[0]] = Base64.encode(String(value[1]), true);
    }
    
    return res
}

export const decode = async (ciphertext) => {
    var bytes  = CryptoJS.AES.decrypt(ciphertext, key);

    try {
        var bytes  = CryptoJS.AES.decrypt(ciphertext, key);
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        
        return Decode(decryptedData)
    } catch {
        return false
    }
}

const Decode = (data) => {
    let res = {}
    let arr = Object.entries(data)

    for(let value of arr) {
        res[value[0]] = Base64.decode(String(value[1]), true);
    }
    
    return res
}