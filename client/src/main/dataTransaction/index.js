import { beginCell, toNano } from '@ton/ton'



export const jettonTransfer = (sender, recipient, address, amount) => {

    const body = beginCell()
    .storeUint(0xf8a7ea5, 32)                 
    .storeUint(0, 64)               
    .storeCoins(amount)
    .storeAddress(recipient) 
    .storeAddress(sender)
    .storeUint(0, 1)                          
    .storeCoins(0)
    .storeUint(0,1)                          
    .endCell();

    return {
        address: address, // адресс жетона
        amount: Number(toNano(0.055)), // коммисия
        payload: body.toBoc().toString("base64")
    }
}

export const nftTransfer = (sender, recipient, address) => {
    const body = beginCell()
        .storeUint(0x5fcc3d14, 32)
        .storeUint(0, 64)
        .storeAddress(recipient) 
        .storeAddress(sender) 
        .storeUint(0, 1)
        .storeCoins(0) 
        .storeUint(0,1)
        .endCell();

    return {
        address: address, // адресс жетона
        amount: Number(toNano(0.10)), // коммисия
        payload: body.toBoc().toString("base64")
    }
}

export const tonTransfer = (recipient, amount) => {
    return {
        address: recipient,
        amount: Number(amount) - Number(toNano(0.0075)),
    }
}

export const sleep = async (time = 5000) => {
    return await new Promise((res, rej) => {
        setTimeout(() => {
            res(true)
        }, time)
    })
}

/*
function storageFeeCalculator() {
    const size = 1024 * 1024 * 8          // 1MB in bits  
    const duration = 60 * 60 * 24 * 365   // 1 Year in secs
  
    const bit_price_ps = 1
    const cell_price_ps = 500
  
    const pricePerSec = size * bit_price_ps +
    + Math.ceil(size / 1023) * cell_price_ps
  
    let fee = (pricePerSec * duration / 2**16 * 10**-9)
    let mb = (size / 1024 / 1024 / 8).toFixed(2)
    let days = Math.floor(duration / (3600 * 24))
    
    let str = `Storage Fee: ${fee} TON (${mb} MB for ${days} days)`

    console.log(str)

    return str
  }

  storageFeeCalculator()
  */