var controls,
    video,
    player,
    volume;

//create event listeners after page load

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        controls = document.getElementsByClassName('ctrl');
        video = document.querySelector('#video');
        player = document.querySelector('#player');
        volume = document.querySelector('#vol');
        progress = document.querySelector('#prog');

        volume.addEventListener("input", function () {
            updatevolume(null)
        });
        progress.addEventListener("input", setprogress);
        video.addEventListener("playing", playcheck);
        video.addEventListener("canplay", updateDisplay);
        video.addEventListener("loadedmetadata", setduration);
        video.addEventListener("click", bpp)
        immerse();

        for (let i = 0; i < controls.length; i++) {
            controls[i].addEventListener("click", function () {
                let func = this.id;
                window[func]()
            })
        }
    }
}
//immerse timeout
let immersetime;

function immerse() {
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    function immerseplayer() {
        document.querySelector('#player').classList.add('immersed')
    }

    function resetTimer() {
        clearTimeout(immersetime);
        document.querySelector('#player').classList.remove('immersed')
        immersetime = setTimeout(immerseplayer, 3000)
    }
}

//set duration
let duration;

function setduration() {
    duration = video.duration;
}

//progress

function setprogress() {
    video.currentTime = progress.value / 1000 * duration;
    updateDisplay();
}

function updateDisplay() {
    let progresspercent = (video.currentTime / duration * 100).toFixed(4),
        bufferpercent = (video.buffered.end(0) / duration * 100).toFixed(4),
        remaining = duration - video.currentTime
    document.documentElement.style.setProperty("--progress", progresspercent + "%");
    document.documentElement.style.setProperty("--buffer", bufferpercent + "%");
    document.querySelector("#elapsed").innerHTML = toTS(video.currentTime);
    document.querySelector("#remaining").innerHTML = toTS(remaining);
    progress.value = Math.floor(progresspercent * 10)
}

function toTS(sec) {
    var hours = Math.floor(sec / 3600);
    var minutes = Math.floor((sec - (hours * 3600)) / 60);
    var seconds = Math.floor(sec - (hours * 3600) - (minutes * 60));
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (hours > 0) {
        return hours + ':' + minutes + ':' + seconds;
    } else {
        return minutes + ':' + seconds;
    }
}

let islooped;

function playcheck() {
    if (!islooped && !video.paused) {
        islooped = true;
        updateDisplay();
        setTimeout(function () {
            islooped = false;
            playcheck();
        }, 50)
    }
}

//play/pause button

function bpp() {
    let btnpp = document.querySelector('#bpp')
    if (video.paused) {
        btnpp.innerHTML = "pause";
        video.play();
    } else {
        btnpp.innerHTML = "play_arrow";
        video.pause();
    }
}

function bnext() {
    console.log("todo")
    //    TODO: get magnet link of next current next episode [using search]
}

//volume shit

let oldlevel;

function bmute() {
    if (video.volume == 0) {
        updatevolume(oldlevel)
    } else {
        oldlevel = video.volume * 100
        updatevolume(0)
    }
}

function updatevolume(a) {
    let btnm = document.querySelector("#bmute"),
        level;
    if (a == null) {
        level = volume.value;
    } else {
        level = a;
        volume.value = a;
    }
    document.documentElement.style.setProperty("--volume-level", level + "%");
    btnm.innerHTML = (level == 0) ? "volume_off" : "volume_up";
    video.volume = level / 100
}


//PiP

function bpip() {
    if (!document.pictureInPictureElement) {
        video.requestPictureInPicture();

    } else {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        }
    }
}

//theathe mode

function btheatre() {
    let nav = document.querySelector('#nav');
    nav.classList.toggle('theatre');
}

//fullscreen

function bfull() {
    let btnfull = document.querySelector('#bfull')
    if (!document.fullscreenElement) {
        player.requestFullscreen();
        btnfull.innerHTML = "fullscreen_exit"
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            btnfull.innerHTML = "fullscreen"
        }
    }
}

function seek(a) {
    video.currentTime += a;
    updateDisplay()
}

//bar related shit

function getPositionP(e) {
    let element = e.target.getBoundingClientRect();
    let x = (e.offsetX / element.width).toFixed(5);
    return {
        x
    };
}

function printPosition(e) {
    let positionP = getPositionP(e);
    e.onmousemove = function () {
        document.querySelector('#vol').innerHTML = positionP.x
    }
}

//keybinds

document.onkeydown = function (a) {
    switch (a.key) {
        case " ":
            bpp();
            break;
        case "n":
            bnext();
            break;
        case "m":
            bmute();
            break;
        case "p":
            bpip();
            break;
        case "t":
            btheatre();
            break;
        case "f":
            bfull();
            break;
        case "s":
            seek(89);
            break;
        case "ArrowLeft":
            seek(-2);
            break;
        case "ArrowRight":
            seek(2);
    }
}

//media session
if ('mediaSession' in navigator) {

    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        album: 'Whenever You Need Somebody',
        artwork: [
            {
                src: 'https://dummyimage.com/96x96',
                sizes: '96x96',
                type: 'image/png'
                },
            {
                src: 'https://dummyimage.com/128x128',
                sizes: '128x128',
                type: 'image/png'
                },
            {
                src: 'https://dummyimage.com/192x192',
                sizes: '192x192',
                type: 'image/png'
                },
            {
                src: 'https://dummyimage.com/256x256',
                sizes: '256x256',
                type: 'image/png'
                },
            {
                src: 'https://dummyimage.com/384x384',
                sizes: '384x384',
                type: 'image/png'
                },
            {
                src: 'https://dummyimage.com/512x512',
                sizes: '512x512',
                type: 'image/png'
                },
    ]
    });

    navigator.mediaSession.setActionHandler('play', function () {
        bpp();
    });
    navigator.mediaSession.setActionHandler('pause', function () {
        bpp();
    });
    navigator.mediaSession.setActionHandler('seekbackward', function () {
        seek(-2);
    });
    navigator.mediaSession.setActionHandler('seekforward', function () {
        seek(2);
    });
    navigator.mediaSession.setActionHandler('nexttrack', function () {
        bnext();
    });
}
