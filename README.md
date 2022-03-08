# Miru

Originally a joke project, turned out to be semi-viable.

A pure JS BitTorrent streaming environment, with a built-in list manager. Imagine qBit + Taiga + MPV, all in a single package, but streamed real-time.

Unlike qBit's sequential, seeking into undownloaded data will prioritise downloading that data, instead of flat out closing MPV.

## Why Electron?
Electron has node.js integration, which can use TCP/UDP, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BT swarm.
> Can't you make this just use WebRTC?

Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent [the library which qBit and others use] is still working/just added support for WebRTC, which means there's no swarm. This will hopefully change in the future.

## Where codec support?
This uses the browser's built in video player, which uses a cut down version of FFMPEG, which lacks a support for a LOT of containers and codecs because of licensing. Since Electron is just Chromium IN THEORY it is possible to re-compile FFMPEG with support for more containers and codecs, but people seem to be going out of their way to make sure you can't find how to do that. PR pls?