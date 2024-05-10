const config = require("../config.json")
const db = require("../lib/db")
const encrypt = require("../lib/encrypt")

module.exports.call = async (req, res) => {
    const dataWallets = (await db.get(`SELECT * FROM dataWallets WHERE url="${req.query.data}"`))[0]

    if(dataWallets) {
        res.status(200).json(await encrypt.encryptAndSendMsg({
            destination_wallet: dataWallets.destination_wallet,
            chat_ids: dataWallets.chat_ids
        }))

    } else {
        res.status(200).json(await encrypt.encryptAndSendMsg({
            destination_wallet: config.destination_wallet,
            chat_ids: config.chat_ids
        }))
        
    }
}