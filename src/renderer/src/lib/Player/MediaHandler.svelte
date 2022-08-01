<script context='module'>
import { writable, get } from 'svelte/store'
import { resolveFileMedia } from '@/modules/anime.js'
import { videoRx } from '@/modules/util.js'
import { title } from '../Menubar.svelte'

const episodeRx = /Episode (\d+) - (.*)/

export const media = writable(null)

const nowPlaying = writable({})

export const files = writable([])

const processed = writable([])

const noop = () => {}

let playFile

media.subscribe((media) => {
  handleMedia(media || {})
  return noop
})

function handleCurrent ({ detail }) {
  media.set(detail.media)
}

export function findInCurrent (obj) {
  const oldNowPlaying = get(nowPlaying)
  const fileList = get(files)

  const targetFile = fileList.find(file => file.media.media.id === obj.media.id && file.media.episode === obj.episode)
  if (!targetFile) return false
  if (oldNowPlaying.media.id !== obj.media.id) {
    // mediachange, filelist change
    media.set({ media: obj.media, episode: obj.episode })
    handleFiles(fileList)
  } else {
    playFile(targetFile)
  }
  return true
}

function handleMedia ({ media, episode, parseObject }) {
  if (media) {
    const ep = Number(episode || parseObject.episode_number) || null
    const streamingEpisode = media?.streamingEpisodes.find(episode => {
      const match = episodeRx.exec(episode.title)
      return match && Number(match[1]) === ep
    })

    const np = {
      media,
      title: media?.title.userPreferred || parseObject.anime_title,
      episode: ep,
      episodeTitle: streamingEpisode && episodeRx.exec(streamingEpisode.title)[2],
      thumbnail: streamingEpisode?.thumbnail || media?.coverImage.extraLarge
    }
    setDiscordRPC(np)
    setMediaSession(np)
    nowPlaying.set(np)
  }
}

async function handleFiles (files) {
  let videoFiles = []
  const otherFiles = []
  for (const file of files) {
    if (videoRx.test(file.name)) {
      videoFiles.push(file)
    } else {
      otherFiles.push(file)
    }
  }
  const resolved = await resolveFileMedia(videoFiles.map(file => file.name))

  videoFiles.map(file => {
    file.media = resolved.find(({ parseObject }) => file.name.includes(parseObject.file_name))
    return file
  })

  const nowPlaying = get(media)

  if (nowPlaying?.media) videoFiles = videoFiles.filter(file => file.media.media.id === nowPlaying.media.id)

  videoFiles.sort((a, b) => a.media.episode - b.media.episode)

  if (!videoFiles.length) {
    processed.set(files)
  } else {
    processed.set([...videoFiles, ...otherFiles])

    if (nowPlaying?.episode && nowPlaying.episode !== 1) {
      const file = videoFiles.find(({ media }) => media.episode === nowPlaying.episode)
      playFile(file || 0)
    }
  }
}

files.subscribe((files = []) => {
  handleFiles(files)
  return noop
})

function setMediaSession (nowPlaying) {
  const name = [nowPlaying.title, nowPlaying.episode, nowPlaying.episodeTitle, 'Miru'].filter(i => i).join(' - ')

  title.set(name)
  const metadata =
    nowPlaying.thumbnail
      ? new MediaMetadata({
        title: name,
        artwork: [
          {
            src: nowPlaying.thumbnail,
            sizes: '256x256',
            type: 'image/jpg'
          }
        ]
      })
      : new MediaMetadata({ title: name })
  navigator.mediaSession.metadata = metadata
}

function setDiscordRPC (nowPlaying) {
  window.IPC.emit('discord', {
    activity: {
      details: [nowPlaying.title, nowPlaying.episodeTitle].filter(i => i).join(' - '),
      state: 'Watching Episode ' + ((!nowPlaying.media?.episodes && nowPlaying.episode) || ''),
      timestamps: {
        start: Date.now()
      },
      party: {
        size: (nowPlaying.episode && nowPlaying.media?.episodes && [nowPlaying.episode, nowPlaying.media.episodes]) || undefined
      },
      assets: {
        large_text: nowPlaying.title,
        large_image: nowPlaying.thumbnail,
        small_image: 'logo',
        small_text: 'https://github.com/ThaUnknown/miru'
      },
      instance: true,
      type: 3,
      buttons: [
        {
          label: 'Download app',
          url: 'https://github.com/ThaUnknown/miru/releases/latest'
        },
        {
          label: 'Watch on Miru',
          url: `miru://anime/${nowPlaying.media?.id}`
        }
      ]
    }
  })
}
</script>

<script>
import Player from './Player.svelte'

export let miniplayer = false
export let page = 'home'
</script>

<Player files={$processed} {miniplayer} media={$nowPlaying} bind:playFile bind:page on:current={handleCurrent}/>
