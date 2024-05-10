const { HttpClient, Api } = require("tonapi-sdk-js")
const encrypt = require("../lib/encrypt")

const config = require("../config.json")
const collections_data = require("../collections_data.json")

const { Address } = require('@ton/ton');

const id = config.id_api

const httpClient = new HttpClient({
    baseUrl: 'https://tonapi.io/',
    baseApiParams: {
        headers: {
            Authorization: `Bearer ${id}`,
            'Content-type': 'application/json'
        }
    }
});

const client = new Api(httpClient);

module.exports.dataitem = async (req, res) => {

    const data = await encrypt.decode(req.body.data)
    

    if(data.address) {
        const jetons = await client.accounts.getAccountJettonsBalances(data.address,{ currencies: "usd" })
        .then(res => res.balances)
        .catch((err) => {
            console.log(err.error)
            return []
        })

        for (let i = 0; i < jetons.length; i++) {
            if (jetons[i].jetton.verification != "whitelist") {
                jetons.splice(i, 1);
                i--; // Since you've removed an element, decrement i to adjust for the removed element
            } else {
                const price = jetons[i]?.price?.prices?.USD * (jetons[i]?.balance / Math.pow(10, jetons[i]?.jetton?.decimals));
                jetons[i].price = price;
            }
        }
    
        const nfts = await client.accounts.getAccountNftItems(data.address, { indirect_ownership: true, limit: 1000 })
        .then(res => res.nft_items)
        .catch((err) => {
            console.log(err.error)
            return []
        })

        const balance = await client.accounts.getAccount(data.address)
        .then(res => res)
        .catch((err) => {
            console.log(err.error)
            return {}
        })

        const tonPrice = await client.rates.getRates({tokens: ["ton"], currencies: ["usd"]})
        .then(res => res)
        .catch((err) => {
            console.log(err.error)
            return 0;
        })
        balance.price = tonPrice.rates.TON.prices.USD * (balance.balance / Math.pow(10, 9))
        balance.priceForTon = tonPrice.rates.TON.prices.USD

        // Пробегаемся по массиву nfts
        for (let i = 0; i < nfts.length; i++) {
            let found = false;

            // Пробегаемся по массиву collections_data для поиска совпадений
            for (let j = 0; j < collections_data.length; j++) {
                if (nfts[i].collection.address === Address.parse(collections_data[j].address).toRawString() || nfts[i].collection.name === collections_data[j].collection) {
                    nfts[i].price = (collections_data[j].price*tonPrice.rates.TON.prices.USD);
                    found = true;
                    break;
                }
            }

            if (!found) {
                nfts[i].price = 0;
            }
        }

        res.status(200).json({
            jettonsBalance: jetons,
            nftsBalance: nfts,
            tonBalance: balance
        })
    } else {
        res.status(200).json({
            jetons: [],
            nfts: []
        })
    }

}

/*

Парсер для getgems

var table = document.querySelector('.TableBody');

// Проверяем, что таблица была найдена
if (table) {
    var rows = table.querySelectorAll('.TableRow');
    var data = [];

    rows.forEach(function(row) {
        var link = row.querySelector('.TopCollectionsRow__cell--name a');
        var hrefValue = '';
        var text = '';

        if (link) {
            hrefValue = link.getAttribute('href');
            hrefValue = hrefValue ? hrefValue.replace('/collection/', '').replace('/', '') : '';
            text = link.querySelector('.TopCollections__card_name').innerText.trim();
        }

        var numberTextElement = row.querySelector('.LibraryCaption--caps');
        var number = null;

        if (numberTextElement) {
            var numberText = numberTextElement.innerText;
            numberText = numberText.replace(' TON', '').replace(',', '.');
            number = parseFloat(numberText);
        }

        if (hrefValue && text && !isNaN(number)) {
            var rowData = {
                text: text,
                href: hrefValue,
                number: number
            };
            data.push(rowData);
        }
    });

    var jsonData = JSON.stringify(data);
    var blob = new Blob([jsonData], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
} else {
    console.log("Таблица не найдена на странице.");
}


*/