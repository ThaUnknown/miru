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
    buffering = document.querySelector("#buffering"),
    thumbnail = document.querySelector("#dThumb")


//event listeners
volume.addEventListener("input", function () {
    updateVolume()
});
progress.addEventListener("input", dragBar);
progress.addEventListener("mouseup", dragBarEnd);
progress.addEventListener("click", dragBarEnd);
progress.addEventListener("mousedown", dragBarStart);
video.addEventListener("playing", resetBuffer);
video.addEventListener("loadeddata", initThumbnail);
video.addEventListener("loadedmetadata", updateDisplay);
video.addEventListener("ended", bnext);
video.addEventListener("waiting", isBuffering);
video.addEventListener("timeupdate", updateDisplay);
video.addEventListener("timeupdate", updatePositionState);
playPause.addEventListener("click", bpp);


for (let i = 0; i < controls.length; i++) {
    controls[i].addEventListener("click", function () {
        let func = this.id;
        window[func]()
    })
}

// progress bar and display

function updateDisplay() {
    let progressPercent = (video.currentTime / video.duration * 100),
        bufferPercent = video.buffered.length == 0 ? 0 : video.buffered.end(video.buffered.length - 1) / video.duration * 100
    progress.style.setProperty("--buffer", bufferPercent + "%");
    updateBar(progressPercent || progress.value / 10);
    createThumbnail(video);
}
function dragBar() {
    video.pause()
    updateBar(progress.value / 10)
}
function dragBarEnd() {
    video.currentTime = currentTime || 0
    playVideo()
}
async function dragBarStart() {
    await video.pause()
    updateBar(progress.value / 10)
}
let currentTime
function updateBar(progressPercent) {
    currentTime = video.duration * progressPercent / 100
    progress.style.setProperty("--progress", progressPercent + "%");
    elapsed.innerHTML = toTS(currentTime);
    remaining.innerHTML = toTS(video.duration - currentTime);
    progress.value = progressPercent * 10
    let bg = thumbnails.length == 0 ? "" : thumbnails[Math.floor(currentTime / 5) || 0]
    progress.style.setProperty("--background", "url(" + (bg || "") + ")")
    progress.style.setProperty("--left", progressPercent + "%")
    progress.setAttribute("data-ts", toTS(currentTime))
}

// dynamic thumbnails 
let thumbnails = [],
    ratio,
    canvas = document.createElement("canvas"),
    context = canvas.getContext('2d'),
    w = 150,
    h

function initThumbnail() {
    thumbnails = []
    ratio = video.videoWidth / video.videoHeight;
    h = parseInt(w / ratio)
    canvas.width = w;
    canvas.height = h;
    progress.style.setProperty("--height", h + "px");
}
function createThumbnail(vid) {
    let index = Math.floor(vid.currentTime / 5)
    if (!thumbnails[index] && h) {
        context.fillRect(0, 0, w, h);
        context.drawImage(vid, 0, 0, w, h);
        thumbnails[index] = canvas.toDataURL("image/jpeg")
    }
}
function finishThumbnails() {
    let thumbVid = document.createElement("video")
    thumbVid.src = video.src
    thumbVid.addEventListener('loadeddata', function (e) {
        loadTime();
    }, false);

    thumbVid.addEventListener('seeked', function () {
        createThumbnail(thumbVid);
        loadTime();
    }, false);

    function loadTime() {
        if (thumbVid.ended == false) {
            thumbVid.currentTime = thumbVid.currentTime + 5;
        } else {
            thumbVid.remove()
        }
    };
}


//bufering spinner

let buffer;
function resetBuffer() {
    if (!!buffer) {
        clearTimeout(buffer)
        buffer = undefined
        buffering.classList.add('hidden')
    }
}

function isBuffering() {
    buffer = setTimeout(displayBuffer, 150)
}
function displayBuffer() {
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
let islooped;


function toTS(sec) {
    if (Number.isNaN(sec)) {
        return "--:--";
    }
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
    nyaaSearch(nowPlaying[0], nowPlaying[1] + 1)
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
                seek(85);
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
function nowPlaying(sel) {
    nowPlaying = sel
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: !!nowPlaying[0].title.english ? nowPlaying[0].title.english : nowPlaying[0].title.romaji,
            artist: "Episode " + nowPlaying[1],
            album: "Miru",
            artwork: [
                {
                    src: nowPlaying[0].coverImage.medium,
                    sizes: '128x128',
                    type: 'image/png'
                }
            ]
        });
    }
}
function updatePositionState() {
    if ('setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
            duration: video.duration || 0,
            playbackRate: video.playbackRate || 0,
            position: video.currentTime || 0
        });
    }
}
if ('mediaSession' in navigator) {
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
