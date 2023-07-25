<script context='module'>
  import { writable, get } from 'svelte/store'
  import { resolveFileMedia } from '@/modules/anime.js'
  import { videoRx } from '@/modules/util.js'
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
      const ep = Number(episode || parseObject?.episode_number) || null
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

  const TYPE_EXCLUSIONS = ['ED', 'ENDING', 'NCED', 'NCOP', 'OP', 'OPENING', 'PREVIEW', 'PV']

  async function handleFiles (files) {
    console.info('MediaHandler: got files', files)
    if (!files?.length) return processed.set(files)
    let videoFiles = []
    const otherFiles = []
    for (const file of files) {
      if (videoRx.test(file.name)) {
        videoFiles.push(file)
      } else {
        otherFiles.push(file)
      }
    }
    let nowPlaying = get(media)

    const resolved = await resolveFileMedia(videoFiles.map(file => file.name))

    videoFiles.map(file => {
      file.media = resolved.find(({ parseObject }) => file.name.includes(parseObject.file_name))
      return file
    })

    videoFiles = videoFiles.filter(file => !TYPE_EXCLUSIONS.includes(file.media.parseObject.anime_type))

    if (nowPlaying?.verified && videoFiles.length === 1) {
      console.info('Media was verified, skipping verification')
      videoFiles[0].media.media = nowPlaying.media
      if (nowPlaying.episode) videoFiles[0].media.episode = nowPlaying.episode
    }

    console.info('MediaHandler: resolved video files', { videoFiles })

    if (!nowPlaying) {
      const max = highestOccurence(videoFiles, file => file.media.media?.id).media
      if (max?.media) {
        nowPlaying = { media: max.media, episode: (max.media.mediaListEntry?.progress + 1 || 1) }
      }
    }

    const filtered = nowPlaying?.media && videoFiles.filter(file => file.media?.media?.id && file.media?.media?.id === nowPlaying.media.id)

    console.info('MediaHandler: filtered files based on media', filtered)

    let result
    if (filtered?.length) {
      result = filtered
    } else {
      const max = highestOccurence(videoFiles, file => file.media.parseObject.anime_title).media.parseObject.anime_title
      console.info('MediaHandler: filtering based on highest occurence', max)
      result = videoFiles.filter(file => file.media.parseObject.anime_title === max)
    }

    result.sort((a, b) => a.media.episode - b.media.episode)
    result.sort((a, b) => (b.media.parseObject.anime_season ?? 1) - (a.media.parseObject.anime_season ?? 1))

    console.info('MediaHandler: final resolve result', { result })

    processed.set([...result, ...otherFiles])
    await tick()
    const file = (nowPlaying?.episode && (result.find(({ media }) => media.episode === nowPlaying.episode) || result.find(({ media }) => media.episode === 1))) || result[0]
    if (nowPlaying) nowPlaying.episode = file.media.parseObject.episode_number
    media.set(nowPlaying)
    playFile(file || 0)
  }

  // find element with most occurences in array according to map function
  const highestOccurence = (arr = [], mapfn = a => a) => arr.reduce((acc, el) => {
    const mapped = mapfn(el)
    acc.sums[mapped] = (acc.sums[mapped] || 0) + 1
    acc.max = (acc.max !== undefined ? acc.sums[mapfn(acc.max)] : -1) > acc.sums[mapped] ? acc.max : el
    return acc
  }, { sums: {} }).max

  files.subscribe((files = []) => {
    handleFiles(files)
    return noop
  })

  function setMediaSession (nowPlaying) {
    const name = [nowPlaying.title, nowPlaying.episode, nowPlaying.episodeTitle, 'Miru'].filter(i => i).join(' - ')

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
    const details = [np.title, np.episodeTitle].filter(i => i).join(' - ') || undefined
    const activity = {
      details,
      state: details && 'Watching Episode ' + ((!np.media?.episodes && np.episode) || ''),
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

<Player files={$processed} {miniplayer} media={$nowPlaying} bind:playFile bind:page on:current={handleCurrent} />
