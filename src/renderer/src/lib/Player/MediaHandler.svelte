<script context='module'>
import { writable, get } from 'svelte/store'
import { resolveFileMedia } from '@/modules/anime.js'
import { videoRx } from '@/modules/util.js'
import { title } from '../Menubar.svelte'
import { tick } from 'svelte'
import { state } from '../WatchTogether/WatchTogether.svelte'

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

  if (oldNowPlaying.media?.id === obj.media.id && oldNowPlaying.episode === obj.episode) return false

  const fileList = get(files)

  const targetFile = fileList.find(file => file.media?.media?.id === obj.media.id && file.media?.episode === obj.episode)
  if (!targetFile) return false
  if (oldNowPlaying.media?.id !== obj.media.id) {
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
  if (!files?.length) return processed.set(files)
  const videoFiles = []
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

  const filtered = nowPlaying?.media && videoFiles.filter(file => file.media?.media?.id && file.media?.media?.id === nowPlaying.media.id)

  const result = (filtered?.length && filtered) || videoFiles

  result.sort((a, b) => a.media.episode - b.media.episode)

  processed.set([...result, ...otherFiles])
  await tick()
  if (nowPlaying?.episode && filtered.length) {
    let file = videoFiles.find(({ media }) => media.episode === nowPlaying.episode)
    if (!file) file = videoFiles.find(({ media }) => media.episode === 1)
    playFile(file || 0)
  } else {
    const max = highest(videoFiles, (file) => file?.media?.media?.id)
    const res = max.media?.media && result.find(({ media }) => media.episode === (max.media.media.mediaListEntry?.progress + 1 || 1) && media.media?.id === max.media.media?.id)
    playFile(res || videoFiles.find(({ media }) => media.episode === 1) || 0)
  }
}

const highest = (arr = [], mapfn = () => {}) => arr.reduce((acc, el) => {
  const mapped = mapfn(el)
  acc.sums[mapped] = (acc.sums[mapped] || 0) + 1
  acc.max = acc.sums[mapfn(acc.max)] > acc.sums[mapped] ? acc.max : el
  return acc
}, { sums: {} }).max

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

function setDiscordRPC (np = get(nowPlaying)) {
  const w2g = get(state)
  const activity = {
    details: [np.title, np.episodeTitle].filter(i => i).join(' - '),
    state: 'Watching Episode ' + ((!np.media?.episodes && np.episode) || ''),
    timestamps: {
      start: Date.now()
    },
    party: {
      size: (np.episode && np.media?.episodes && [np.episode, np.media.episodes]) || undefined
    },
    assets: {
      large_text: np.title,
      large_image: np.thumbnail,
      small_image: 'logo',
      small_text: 'https://github.com/ThaUnknown/miru'
    },
    instance: true,
    type: 3
  }
  // cannot have buttons and secrets at once
  if (w2g) {
    activity.secrets = {
      join: w2g,
      match: w2g + 'm'
    }
    activity.party.id = w2g + 'p'
  } else {
    activity.buttons = [
      {
        label: 'Download app',
        url: 'https://github.com/ThaUnknown/miru/releases/latest'
      },
      {
        label: 'Watch on Miru',
        url: `miru://anime/${np.media?.id}`
      }
    ]
  }
  window.IPC.emit('discord', { activity })
}
state.subscribe(() => {
  setDiscordRPC()
  return noop
})
</script>

<script>
import Player from './Player.svelte'

export let miniplayer = false
export let page = 'home'
</script>

<Player files={$processed} {miniplayer} media={$nowPlaying} bind:playFile bind:page on:current={handleCurrent}/>
