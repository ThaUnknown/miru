const settingsElements = {
    player1: player1,
    player2: player2,
    player3: player3,
    player4: player4,
    player5: player5,
    player6: player6,
    player7: player7,
    subtitle1: subtitle1,
    torrent1: torrent1,
    torrent2: torrent2,
    torrent3: torrent3
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
        player6: true,
        player7: true,
        subtitle1: "'Open Sans', sans-serif",
        torrent1: "1080",
        torrent2: false,
        torrent3: true
    }
    localStorage.setItem("settings", JSON.stringify(settings))
    renderSettings()
}
let applyTimeout
function applySettings() {
    clearTimeout(applyTimeout)
    applyTimeout = setTimeout(() => {
        Object.entries(settings).forEach(setting => {
            if (settingsElements[setting[0]].type == "checkbox") {
                settings[setting[0]] = settingsElements[setting[0]].checked
            } else {
                settings[setting[0]] = settingsElements[setting[0]].value
            }
        })
        localStorage.setItem("settings", JSON.stringify(settings))
    }, 1000)
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

if (!localStorage.getItem("settings")) {
    restoreDefaults()
}
settings = JSON.parse(localStorage.getItem("settings"))
renderSettings()
setRes.addEventListener("click", restoreDefaults)
settingsTab.addEventListener("click", applySettings)