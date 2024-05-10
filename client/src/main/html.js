const conects = document.querySelectorAll('[data-id="conteiner_connect"]')
const connected = document.querySelectorAll('[data-id="conteiner_connected"]')

const addressFrendly = document.querySelectorAll('[data-id="ton-address-userfrendly"]')
const address = document.querySelectorAll('[data-id="ton-address"]')

const spinner = document.querySelectorAll('[data-id="spinner"]')
const spinnerText = document.querySelectorAll('[data-id="spinner-text"]')

export const HtmlConected = () => {
    for(let section of conects) {
        section.style = "display: none"
    }
    for(let section of connected) {
        section.style = ""
    }
    
}

export const HtmlConect = (userFriendlyAddress, rawAddress) => {
    for(let section of conects) {
        section.style = ""
    }
    for(let section of connected) {
        section.style = "display: none"
    }


    for(let section of addressFrendly) {
        section.innerHTML = userFriendlyAddress.slice(0, 4) + "..." + userFriendlyAddress.slice(userFriendlyAddress.length - 4, userFriendlyAddress.length)
    }

    for(let section of address) {
        section.innerHTML = rawAddress
    }
}

export const HtmlSpiner = (status, text) => {
    if(status) {
        for(let section of spinner) {
            section.style = ""
        }
        for(let section of spinnerText) {
            section.style = "display: none"
        }

    } else {
        for(let section of spinner) {
            section.style = "display: none"
        }

        for(let section of spinnerText) {
            section.style = ""
        }
    }


    if(text) {
        for(let section of spinnerText) {
            section.innerHTML = text
        }
    }
}