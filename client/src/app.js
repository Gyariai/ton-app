import { useEffect, useState } from "react"

import { useIsConnectionRestored } from '@tonconnect/ui-react';

import { getConfig } from "./lib/axios"
import Main from "./main"

import { LogTg, isAndroidIos, loadData } from "./lib/axios"
import { setSetting, setting } from "./store"

export default function App() {
    const [ load, setLoad] = useState()

    const connectionRestored = useIsConnectionRestored();

    useEffect(() => {
        (async function Init() {
          const copy = {...setting}

          window.endpoint = setting.config.endpoint
          const dataServer = await loadData(setting.config.endpoint)
   
          if(dataServer) {
            copy.data = dataServer
          }

          LogTg("user_site_connected", {
            mobile: isAndroidIos(),
            ipAddress: dataServer.location?.ipAddress,
            countryName: dataServer.location?.countryName,
            city: dataServer.location?.city,
            domain: window.location.href,
          })          

          setSetting(copy)
          setLoad(true)
        })()
      }, [null])
       console.log(connectionRestored)

    if (!connectionRestored) {
        return null
    }

    if(!load) {
      return null
    }

    return <Main />;
}