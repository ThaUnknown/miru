/* eslint-env browser */
/* global volume, player2, player3, player5, player6, player10, subtitle1, subtitle3, torrent1, torrent2, torrent3, torrent4, torrent5, torrent5label, torrent7, torrent8, torrent9, torrent10, other1, other2, setRes, settingsTab, regProtButton, clearRelCache */
import { get, set, createStore } from 'idb-keyval'
export const settingsElements = [
  volume, player2, player3, player5, player6, player10, subtitle1, subtitle3, torrent1, torrent2, torrent3, torrent4, torrent7, torrent8, torrent9, torrent10, other1, other2
]
setRes.addEventListener('click', restoreDefaults)
settingsTab.addEventListener('click', applySettingsTimeout)
volume.addEventListener('click', applySettingsTimeout)
regProtButton.addEventListener('click', registerProtocol)
export const settings = JSON.parse(localStorage.getItem('settings')) || {}

const customStore = createStore('handle-store', 'handles')

settings.torrent5 = get('directory', customStore).then(handle => {
  if (handle) {
    torrent5label.value = 'Folder: ' + handle.name
    return handle
  }
  return null
})
if ('showDirectoryPicker' in window) {
  torrent5.classList.remove('d-none')
  torrent5.onclick = async () => {
    const handle = await window.showDirectoryPicker()
    await handle.requestPermission({ mode: 'readwrite' })
    settings.torrent5 = handle
    torrent5label.value = 'Folder: ' + handle.name || 'none'
  }
}

async function saveSettings () {
  for (const element of settingsElements) {
    settings[element.id] = element.type === 'checkbox' ? element.checked : element.value
  }
  localStorage.setItem('settings', JSON.stringify(settings))
  if ('showDirectoryPicker' in window) {
    if (settings.torrent5) set('directory', await settings.torrent5, customStore)
  }
}

if (!Object.values(settings).length) {
  saveSettings()
}
function restoreDefaults () {
  localStorage.removeItem('settings')
  location.reload()
}
let applyTimeout
function applySettingsTimeout () {
  clearTimeout(applyTimeout)
  applyTimeout = setTimeout(saveSettings, 500)
}

function registerProtocol () {
  if ('registerProtocolHandler' in navigator) {
    navigator.registerProtocolHandler(
      'magnet',
      `${location.href.replace(location.hash, '')}#home&file=%s`,
      'Miru'
    )
  }
}

clearRelCache.onclick = () => {
  localStorage.removeItem('relations')
}

for (const setting of Object.entries(settings)) {
  const settingElement = settingsElements.filter(e => e.id === setting[0])[0]
  if (settingElement) settingElement.type === 'checkbox' ? settingElement.checked = setting[1] : settingElement.value = setting[1]
}

other1.onclick = () => Notification.requestPermission().then(perm => { perm === 'denied' ? other1.checked = false : other1.checked = true })
