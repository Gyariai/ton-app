import config from "../config.json"

export let setting = {
    data: {}, config: config
}

export const setSetting = (data) => {
    setting = data
}