const CryptoJS = require("crypto-js");
const { Base64 } = require('js-base64');

const db = require("./db")

module.exports.unit8encode = async (ciphertext) => {
    const result = []

    ciphertext.forEach(value => {
        result.push(Base64.fromUint8Array(value))
    });
    
    return JSON.stringify(result)
}

module.exports.unit8decode = async (ciphertext) => {
    const result = []
   
    const data = JSON.parse(ciphertext)
    data.forEach(value => {
        result.push(Base64.toUint8Array(value))
    })

    return result
}

module.exports.decode = async (ciphertext) => {
    try {
        const key = (await db.get(`SELECT * FROM keys`))[0]?.keygen

        
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


module.exports.encryptAndSendMsg = async (msg) => {
    const key = (await db.get(`SELECT * FROM keys`))[0].keygen
  
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

