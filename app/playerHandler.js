const controls = document.getElementsByClassName('ctrl'),
    video = document.querySelector('#video'),
    player = document.querySelector('#player'),
    volume = document.querySelector('#vol'),
    progress = document.querySelector('#prog'),
    peers = document.querySelector('#peers'),
    downSpeed = document.querySelector('#down'),
    upSpeed = document.querySelector('#up'),
    playPause = document.querySelector('#ptoggle'),
    btnpp = document.querySelector('#bpp'),
    btnm = document.querySelector("#bmute"),
    btnfull = document.querySelector('#bfull'),
    elapsed = document.querySelector("#elapsed"),
    remaining = document.querySelector("#remaining"),
    buffering = document.querySelector("#buffering")

volume.addEventListener("input", function () {
    updateVolume()
});
progress.addEventListener("input", setProgress);
video.addEventListener("playing", playCheck);
video.addEventListener("playing", resetBuffer);
video.addEventListener("canplay", updateDisplay);
video.addEventListener("loadedmetadata", setDuration);
video.addEventListener("ended", bnext);
video.addEventListener("waiting", isBuffering);
playPause.addEventListener("click", bpp);


for (let i = 0; i < controls.length; i++) {
    controls[i].addEventListener("click", function () {
        let func = this.id;
        window[func]()
    })
}

let buffer;
function resetBuffer(){
    if (!!buffer){
        clearTimeout(buffer)
        buffer = undefined
        buffering.classList.add('hidden')
    }
}

function isBuffering() {
    buffer = setTimeout(displayBuffer, 150)
}
function displayBuffer (){
    buffering.classList.remove('hidden')
    resetTimer()
}
//immerse timeout
let immerseTime;


document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
function immersePlayer() {
    player.classList.add('immersed')
}

function resetTimer() {
    clearTimeout(immerseTime);
    player.classList.remove('immersed')
    immerseTime = setTimeout(immersePlayer, 3000)
}


//set duration
let duration;

function setDuration() {
    duration = video.duration;
}

//progress

function setProgress() {
    video.currentTime = progress.value / 1000 * duration;
    updateDisplay();
}

let progressPercent,
    bufferPercent,
    remainingTime

function updateDisplay() {
    progressPercent = (video.currentTime / duration * 100).toFixed(4)
    bufferPercent = (video.buffered.length == 0 ? 0 : video.buffered.end(video.buffered.length - 1) / duration * 100).toFixed(4)
    remainingTime = duration - video.currentTime
    document.documentElement.style.setProperty("--progress", progressPercent + "%");
    document.documentElement.style.setProperty("--buffer", bufferPercent + "%");
    elapsed.innerHTML = toTS(video.currentTime);
    remaining.innerHTML = toTS(remainingTime);
    progress.value = Math.floor(progressPercent * 10)
}

function toTS(sec) {
    let hours = Math.floor(sec / 3600),
        minutes = Math.floor((sec - (hours * 3600)) / 60),
        seconds = Math.floor(sec - (hours * 3600) - (minutes * 60));
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    if (hours > 0) {
        return `${hours}:${minutes}:${seconds}`;
    } else {
        return `${minutes}:${seconds}`;
    }
}

let islooped;

function playCheck() {
    if (!islooped && !video.paused) {
        islooped = true;
        updateDisplay();
        setTimeout(function () {
            islooped = false;
            playCheck();
        }, 50)
    }
}

//play/pause button
async function playVideo() {
    try {
        await video.play();
        btnpp.innerHTML = "pause";
    } catch (err) {
        btnpp.innerHTML = "play_arrow";
    }
}
function bpp() {
    if (video.paused) {
        playVideo();
    } else {
        btnpp.innerHTML = "play_arrow";
        video.pause();
    }
}

function bnext() {
    nyaaSearch(nowPlaying[0], nowPlaying[1]+1)
}

//volume shit

let oldlevel;

function bmute() {
    if (video.volume == 0) {
        updateVolume(oldlevel)
    } else {
        oldlevel = video.volume * 100
        updateVolume(0)
    }
}

let level;

function updateVolume(a) {
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

    } else if (document.pictureInPictureElement) {
        document.exitPictureInPicture();

    }
}

//theathe mode

function btheatre() {
    halfmoon.toggleSidebar();
}

//fullscreen

function bfull() {
    if (!document.fullscreenElement) {
        player.requestFullscreen();
        btnfull.innerHTML = "fullscreen_exit"
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
        btnfull.innerHTML = "fullscreen"

    }
}

function seek(a) {
    video.currentTime += a;
    updateDisplay()
}

//keybinds

document.onkeydown = function (a) {
    if (document.location.href.endsWith("#player")) {
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
}
//media session
if ('mediaSession' in navigator) {

    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'THE GOD OF HIGH SCHOOL',
        artist: 'Miru',
        artwork: [
            {
                src: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx116006-XasdW0bB4n18.png',
                sizes: '128x128',
                type: 'image/png'
            }
        ]
    });

    navigator.mediaSession.setActionHandler('play', bpp);
    navigator.mediaSession.setActionHandler('pause', bpp);
    navigator.mediaSession.setActionHandler('seekbackward', function () {
        seek(-2);
    });
    navigator.mediaSession.setActionHandler('seekforward', function () {
        seek(2);
    });
    navigator.mediaSession.setActionHandler('nexttrack', bnext);
}