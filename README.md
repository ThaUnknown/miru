<p align="center">
	<a href="https://github.com/ThaUnknown/miru">
		<img src="./static/logo_white.svg" width="300">
	</a>
</p>
<h1 align="center"><b>Hayase</b></h1>

<h4 align="center"><b>Stream anime torrents instantly, real-time with no waiting for downloads to finish! 🍿</b></h4>

<p align="center">
  <a href="https://hayase.watch/#about">About</a> •
  <a href="https://hayase.watch/features/">Features</a> •
  <a href="https://hayase.watch/faq/">Frequently Asked Questions</a> •
  <a href="https://hayase.watch/download/">Download</a>
</p>
<p align="center">
  <a href="https://discord.gg/Z87Nh7c4Ac">
    <img src="https://img.shields.io/discord/953341991134064651?style=flat-square" alt="chat">
  </a>
  <a href="https://hayase.watch/download/">
    <img alt="Download" src="https://img.shields.io/github/downloads/ThaUnknown/miru/total?style=flat-square">
  </a>
</p>

## ✨ About

**Hayase** is a modern app for streaming anime torrents in real-time, with no waiting for downloads to finish.

It is meant to feel look, work and perform like a premium streaming service, but with all the benefits of both streaming and torrenting, like file downloads, higher download speeds, better video quality, instant access to new releases, and features you won’t find on typical streaming sites.

## 🌟 Highlights

* 📚 **Anime list integration:** Sync with AniList, Kitsu, ~~MAL~~, or use local storage.
* ⚡ **Instant torrent streaming:** Watch as you download, with extension support for custom sources.
* 📴 **Offline viewing:** Enjoy already-downloaded torrents anytime.
* 🎬 **Advanced video player:** Full support for all subtitle formats, softcoded and external tracks, and more.
* 👥 **Social features:** Connect with friends, join discussions, and watch together.

***

## 🏆 Features

### 🎞️ Anime Management

* Effortlessly manage your anime list with support for AniList, Kitsu, ~~MAL~~, and local storage.
* Automatically track watched episodes.
* See what you’re behind on, and discover sequels you’ve missed.
* Keep up to date and browse upcoming episodes with airing calendars.
* Edit entries (score, progress, status, favorite, etc.) even while offline.
* Search by image, name, genre, year, season, and more.
* View trailers, OP/ED themes, and detailed episode lists with thumbnails, descriptions and filler indicators.

### 🤝 Social & Community

* Instantly see which friends are following an anime or episode.
* See friends profiles and watch progress in the episodes list.
* Track your friends’ watch progress in real time.
* Join episode discussions and forums, even offline.
* Global app chat.
* Discord rich pressence.
* Host or join Watch Together lobbies with synced playback and chat.

### 🎥 Video Experience

* Full subtitle support.
  * Softcoded, external and manually added subtitles.
  * VTT, SSA, ASS, SUB, TXT formats.
  * Subtitle display in PiP.
  * Override default dialog styles.
  * Override default fonts for Asian languages \[fix for bad torrents].
* Picture In Picture.
  * PiP on lost visiblity.
* Pause on lost visibility.
* Specify preferred language for video and subtitle tracks.
* Remove video compression artifacts.
* Miniplayer.
* Media Session display.
* Media Keys support.
* Discord rich pressence.
* Seek and preview thumbnails.
* Autoplay next episode.
* Skip intro/outro, manually or automatically.
* Skip filler episodes automatically.
* Change playback rate.
* Browse playlist.
* Multi-track support for video, audio and subtitles.
* Editable keybinds for all player functions.
* Exponential volume \[better control at lower volumes].
* External player support.

### 🧲 Torrents

* Stream torrents instantly, no waiting for full downloads.
* Download only what you need for playback.
* Choose your downloads folder and set speed/connection limits.
* Support for custom extensions, sources, and trackers.
* Specify download/upload speeds, ports and connections.
* Support for most popular BEP's.
* Persist torrents, cache progress, and rescan instantly.
* View detailed torrent and peer info.

### ⚙️ Performance & Security

* Highly secure.
  * Operates on a Zero Trust model.
  * Protects data integrity and settings from external attacks.
  * Protects from attacks via malicious torrent extensions.
  * Uses up to date best security practices for native apps.
* Insanely performant.
  * Fully hardware/GPU accelerated.
  * GPU based shaders, animations and paints.
* Very low resource utilisation.
  * Only loads code as required by user navigation.
  * Unloads code not in use.
  * Doesn't render unnecessary UI updates.
  * Disables rendering when not visible.
  * Doesn't render any UI when immersed in fullscreen video.
* Minimise to tray.
* In-app changelog.
* Custom themes.

## **Building and Development**

Requires `Node 20` or above and `pnpm`. VSCode is recommended.

```js
pnpm i // to install
pnpm run dev // to develop
pnpm run build // to build
pnpm run sync && pnpm run lint && pnpm run gql:check && pnpm run check // to test
```

***

<h2 align="center">
  <b>Enjoy streaming anime the way it should be! 🍿</b>
</h2>
