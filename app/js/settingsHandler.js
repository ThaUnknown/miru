const settingsElements = {
    player1: player1,
    player2: player2,
    player3: player3,
    player4: player4,
    player5: player5,
    player6: player6,
    player7: player7,
    player8: player8,
    subtitle1: subtitle1,
    subtitle2: subtitle2,
    subtitle3: subtitle3,
    torrent1: torrent1,
    torrent2: torrent2,
    torrent3: torrent3,
    torrent4: torrent4,
    torrent5: torrent5,
    other1: other1,
    other2: other2
}
let settings
function restoreDefaults() {
    localStorage.clear();
    settings = {
        player1: "100",
        player2: "4",
        player3: "3",
        player4: "2",
        player5: true,
        player6: false,
        player7: true,
        player8: true,
        subtitle1: "'Open Sans', sans-serif",
        subtitle2: true,
        subtitle3: true,
        torrent1: "1080",
        torrent2: false,
        torrent3: true,
        torrent4: "https://subsplease.org/rss/?r=",
        torrent5: false,
        other1: 100,
        other2: true
    }
    localStorage.setItem("settings", JSON.stringify(settings))
    renderSettings()
}
let applyTimeout
function applySettings() {
    clearTimeout(applyTimeout)
    applyTimeout = setTimeout(() => {
        Object.entries(settingsElements).forEach(setting => {
            if (settingsElements[setting[0]].type == "checkbox") {
                settings[setting[0]] = settingsElements[setting[0]].checked
            } else {
                settings[setting[0]] = settingsElements[setting[0]].value
            }
        })
        localStorage.setItem("settings", JSON.stringify(settings))
    }, 500)
}

function renderSettings() {
    Object.entries(settings).forEach(setting => {
        if (settingsElements[setting[0]].type == "checkbox") {
            settingsElements[setting[0]].checked = setting[1]
        } else {
            settingsElements[setting[0]].value = setting[1]
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
    restoreDefaults()
}
settings = JSON.parse(localStorage.getItem("settings"))
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