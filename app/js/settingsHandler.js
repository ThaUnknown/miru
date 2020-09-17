const settingsElements = {
    player1: document.querySelector("#player1"),
    player2: document.querySelector("#player2"),
    player3: document.querySelector("#player3"),
    player4: document.querySelector("#player4"),
    player5: document.querySelector("#player5"),
    player6: document.querySelector("#player6"),
    player7: document.querySelector("#player7"),
    subtitle1: document.querySelector("#subtitle1"),
    torrent1: document.querySelector("#torrent1"),
    torrent2: document.querySelector("#torrent2"),
    torrent3: document.querySelector("#torrent3")
}

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
function applySettings() {
    Object.entries(settings).forEach(setting => {
        if (settingsElements[setting[0]].type == "checkbox") {
            settings[setting[0]] = settingsElements[setting[0]].checked
        } else {
            settings[setting[0]] = settingsElements[setting[0]].value
        }
    })
    localStorage.setItem("settings", JSON.stringify(settings))
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
    renderSettings()
}
let settings = JSON.parse(localStorage.getItem("settings"))
renderSettings()
document.querySelector("#setApply").addEventListener("click", applySettings)
document.querySelector("#setRes").addEventListener("click", restoreDefaults)