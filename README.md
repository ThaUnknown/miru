<p align="center">
	<a href="https://github.com/OMetaVR/voya">
		<img src="./web/static/logo_filled.svg" width="200">
	</a>
</p>
<h1 align="center"><b>Voya</b></h1>

<h4 align="center"><b>Stream media torrents, real-time with no waiting for downloads</b></h4>

<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#building-and-development">Building and Development</a> •
  <a href="https://github.com/OMetaVR/voya/releases">Download</a>
</p>
<p align="center">
  <img src="./docs/out.gif" alt="showcase"><br>
  <a href="https://discord.gg/Z87Nh7c4Ac">
    <img src="https://img.shields.io/discord/953341991134064651?style=flat-square" alt="chat">
  </a>
  <a href="https://github.com/OMetaVR/voya/releases">
    <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/OMetaVR/voya/total?style=flat-square">
  </a>
</p>

## **About**
Voya is a real-time BitTorrent streaming application designed to provide a seamless media consumption experience, combining the benefits of torrents with the convenience of streaming. Think of it as a hybrid between qBitTorrent, a media player, and a streaming service—but with a twist. There’s no waiting for downloads to finish before you start watching!

This app is entirely ad-free and doesn’t collect any personal data, focusing solely on delivering a smooth, high-quality viewing experience.

Unlike other torrent clients that stop playback when seeking into undownloaded data, Voya will prioritize downloading the required data so you can keep watching without interruptions.

## **Features**
### **General Media Support**:
- Fully customizable torrent streaming with **no waiting** for downloads
- Automatic detection of media type (anime, movies, TV shows, etc.)
- Support for streaming from a variety of torrent sources

### **Anime Features**:
- Full **AniList** integration for managing your anime library
  - Filter anime by name, genre, season, year, format, and status
  - View and manage your planning and watching list
  - Automatically mark episodes as complete as you watch them
  - Watch trailers and previews for anime
  - Score and rate anime
  - View anime relations
- Automatically find torrents for episodes
- Find anime by image (just paste an image into the app)
- View the latest releases via custom RSS feeds
- Airing schedule support for anime

### **Video Features**:
- Full subtitle support, including:
  - Softcoded subtitles
  - External subtitle files (VTT, SSA, ASS, SUB, TXT, etc.)
  - Subtitle display in picture-in-picture mode
- Keybinds for all functions:
  - **S** - Skip forward 90 seconds (great for skipping intros)
  - **R** - Seek backwards 90 seconds
  - **→** / **←** - Fine-tune seek by 2 seconds
  - **↑** / **↓** - Adjust volume
  - **M** - Mute/unmute
  - **C** - Cycle through available subtitles
  - **N** - Play the next episode (if available)
  - **B** - Play the previous episode (if available)
  - **F** - Toggle fullscreen
  - **P** - Toggle picture-in-picture
  - **[** / **]** - Increase/decrease playback speed
  - **\\** - Reset playback speed to normal
  - **I** - View video stats
  - **`** - Open keybind settings UI
- Editable keybinds with drag-and-drop customization
- Miniplayer mode
- Media session display with rich notifications
- Support for media keys and Discord rich presence
- Preview thumbnails and auto-pause on lost focus
- Autoplay next episode
- Multi-audio track support
- Torrent download progress shown in the seek bar

### **Torrent Features**:
- Select your desired download folder
- Control download/upload speed limits
- Full support for popular BitTorrent protocol extensions
- Custom torrent RSS feed support
- Change resolution settings for torrent searches
- Seamlessly stream torrents in real-time with no waiting for downloads

## **Linux Installation**

### Arch

If you use paru:
```bash
paru -S voyabin
```

If you use yay:
```bash
yay -S voyabin
```

### Debian/Ubuntu

- Download the `.deb` file from the [releases](https://github.com/OMetaVR/voya/releases/latest) page.
- Install the `.deb` file using the package manager:
```bash
apt install linux-Voya-*.deb
```

## **Building and Development**

To build and develop Voya locally, you'll need the following dependencies:
- Node.js 16 or above
- PNPM (Package manager)
- Docker
- Android Debug Bridge (ADB)
- Java 18 or above (possibly required)
- Other dependencies may also be required—good luck!

For full development instructions, refer to the [official repository](https://github.com/OMetaVR/voya).

---

**Note**: While Voya is based on [Miru](https://github.com/ThaUnknown/miru), it’s a **distinct fork** with additional features and customizations to better serve a broader range of media types. The **Miru community** is still where the original product is developed and supported, but Voya adds new functionalities and provides a personalized experience.
