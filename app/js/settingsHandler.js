const settingsElements = [
    player1, player2, player3, player4, player5, player6, player7, player8, subtitle1, subtitle2, subtitle3, torrent1, torrent2, torrent3, torrent4, torrent5, other1, other2
]
let settings = {}
function restoreDefaults() {
    localStorage.removeItem("settings");
    location.reload()
}
let applyTimeout
function applySettings() {
    clearTimeout(applyTimeout)
    applyTimeout = setTimeout(() => {
        settingsElements.forEach(element => {
            if (element.type == "checkbox") {
                settings[element.id] = element.checked
            } else {
                settings[element.id] = element.value
            }
        })
        localStorage.setItem("settings", JSON.stringify(settings))
    }, 500)
}

function renderSettings() {
    Object.entries(settings).forEach(setting => {
        let settingElement = settingsElements.filter(e => e.id == setting[0])[0]
        if (settingElement.type == "checkbox") {
            settingElement.checked = setting[1]
        } else {
            settingElement.value = setting[1]
        }
    })
}
function registerProtocol() {
    if ('registerProtocolHandler' in navigator) {
        navigator.registerProtocolHandler(
            'magnet',
            `${location.href.replace(location.hash, '')}#&m=%s`,
            'Miru'
        );
    }
}

if (!localStorage.getItem("settings")) {
    applySettings()
} else {
    settings = JSON.parse(localStorage.getItem("settings"))
}
renderSettings()
setRes.addEventListener("click", restoreDefaults)
settingsTab.addEventListener("click", applySettings)
regProtButton.addEventListener("click", registerProtocol)

let searchParams = new URLSearchParams(location.href)
if (searchParams.get("access_token")) {
    localStorage.setItem("ALtoken", searchParams.get("access_token"))
    window.location = "/app/#settingsTab"
}

document.body.style.zoom = settings.other1 + "%"