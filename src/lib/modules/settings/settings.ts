import { persisted } from 'svelte-persisted-store'

import native from '../native'

import { defaults } from '.'

export const settings = persisted('settings', defaults, { beforeRead: value => ({ ...defaults, ...value }) })

settings.subscribe(settings => {
  const { torrentPersist, torrentDHT, torrentStreamedDownload, torrentSpeed, maxConns, torrentPort, dhtPort, torrentPeX } = settings
  native.updateSettings({ torrentPersist, torrentDHT, torrentStreamedDownload, torrentSpeed, maxConns, torrentPort, dhtPort, torrentPeX })
  native.setHideToTray(settings.hideToTray)
  native.transparency(settings.idleAnimation)
  native.setZoom(settings.uiScale)
  if (settings.enableDoH) native.setDOH(settings.doHURL)
})
