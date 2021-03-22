const settingsElements = [
  volume, player2, player3, player5, player6, player10, subtitle1, subtitle3, torrent1, torrent2, torrent3, torrent4, torrent5, torrent6, torrent7, torrent9, other1, other2
]
setRes.addEventListener('click', restoreDefaults)
settingsTab.addEventListener('click', applySettingsTimeout)
volume.addEventListener('click', applySettingsTimeout)
regProtButton.addEventListener('click', registerProtocol)
let settings = {}
function restoreDefaults () {
  localStorage.removeItem('settings')
  location.reload()
}
let applyTimeout
function applySettingsTimeout () {
  clearTimeout(applyTimeout)
  applyTimeout = setTimeout(saveSettings, 500)
}
function saveSettings () {
  settingsElements.forEach(element => {
    element.type === 'checkbox' ? settings[element.id] = element.checked : settings[element.id] = element.value
  })
  localStorage.setItem('settings', JSON.stringify(settings))
}

function renderSettings () {
  Object.entries(settings).forEach(setting => {
    const settingElement = settingsElements.filter(e => e.id === setting[0])[0]
    if (settingElement) settingElement.type === 'checkbox' ? settingElement.checked = setting[1] : settingElement.value = setting[1]
  })
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

if (!localStorage.getItem('settings')) {
  saveSettings()
  location.reload()
} else {
  settings = JSON.parse(localStorage.getItem('settings'))
}
clearRelCache.onclick = () => {
  localStorage.removeItem('store')
  store = {}
}
renderSettings()

other1.onclick = () => Notification.requestPermission().then(function (perm) { perm === 'denied' ? other1.checked = false : other1.checked = true })

const searchParams = new URLSearchParams(location.href)
if (searchParams.get('access_token')) {
  localStorage.setItem('ALtoken', searchParams.get('access_token'))
  window.location = '/app/#settingsTab'
}
const userBrowser = (function () {
  if (window.chrome) {
    if (navigator.userAgent.indexOf('Edg') !== -1) {
      return 'edge'
    } else {
      return 'chromium'
    }
  }
  if (typeof InstallTrigger !== 'undefined') return 'firefox'
}())
