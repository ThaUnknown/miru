import { add } from './torrent.js'
import { DOMPARSER, PromiseBatch } from './util.js'
import { alRequest } from './anilist.js'
import anitomyscript from 'anitomyscript'
import { addToast } from '@/lib/Toasts.svelte'
import { view } from '@/App.svelte'

const torrentRx = /(^magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent$){1}/i
const imageRx = /\.(jpeg|jpg|gif|png|webp)/i

fetch('https://nyaa.si').catch(() => {
  addToast({
    text: 'Failed connecting to Nyaa! Visit<br>wiki.piracy.moe/en/tutorials/unblock<br>for a guide on how to bypass ISP blocks.',
    title: 'Nyaa Blocked',
    type: 'danger'
  })
})

window.addEventListener('paste', async e => { // WAIT image lookup on paste, or add torrent on paste
  const item = e.clipboardData.items[0]
  if (item?.type.indexOf('image') === 0) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('image', item.getAsFile())
    traceAnime(formData, 'file')
  } else if (item?.type === 'text/plain') {
    item.getAsString(text => {
      if (torrentRx.exec(text)) {
        e.preventDefault()
        add(text)
      } else if (imageRx.exec(text)) {
        e.preventDefault()
        traceAnime(text)
      }
    })
  } else if (item && item.type === 'text/html') {
    item.getAsString(text => {
      const img = DOMPARSER(text, 'text/html').querySelectorAll('img')[0]
      if (img) {
        e.preventDefault()
        traceAnime(img.src)
      }
    })
  }
})
function traceAnime (image, type) { // WAIT lookup logic
  if (type === 'file') {
    const reader = new FileReader()
    reader.onload = e => {
      addToast({
        title: 'Looking up anime for image',
        text: `<img class="w-200 rounded pt-5" src="${e.target.result}">`
      })
    }
    reader.readAsDataURL(image.get('image'))
  } else {
    addToast({
      title: 'Looking up anime for image',
      text: `<img class="w-200 rounded pt-5" src="${image}">`
    })
  }
  let options
  let url = `https://api.trace.moe/search?cutBorders&url=${image}`
  if (type === 'file') {
    options = {
      method: 'POST',
      body: image
    }
    url = 'https://api.trace.moe/search'
  }
  fetch(url, options).then(res => res.json()).then(async ({ result }) => {
    if (result && result[0].similarity >= 0.85) {
      const res = await alRequest({ method: 'SearchIDSingle', id: result[0].anilist })
      view.set(res.data.Media)
    } else {
      addToast({
        text: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.',
        title: 'Search Failed',
        type: 'danger'
      })
    }
  })
}
export const episodeRx = /Episode (\d+) - (.*)/

// resolve anime name based on file name and store it
const postfix = {
  1: 'st',
  2: 'nd',
  3: 'rd'
}

async function resolveTitle (name) {
  const method = { name, method: 'SearchName', perPage: 1, status: ['RELEASING', 'FINISHED'], sort: 'SEARCH_MATCH' }

  // inefficient but readable

  let media = null
  // change S2 into Season 2 or 2nd Season
  const match = method.name.match(/ S(\d)$/)
  const oldname = method.name
  try {
    if (match) {
      method.name = method.name.replace(/ S(\d)$/, ` ${match[1]}${postfix[match[1]] || 'th'} Season`)
      media = (await alRequest(method)).data.Page.media[0]
      if (!media) {
        method.name = oldname.replace(/ S(\d)$/, ` Season ${match[1]}`)
        media = (await alRequest(method)).data.Page.media[0]
      }
    } else {
      media = (await alRequest(method)).data.Page.media[0]
    }

    // remove (TV)
    if (!media) {
      const match = method.name.match(/\(TV\)/)
      if (match) {
        method.name = name.replace('(TV)', '').replace('-', '')
        media = (await alRequest(method)).data.Page.media[0]
      }
    }
    // remove 2020
    if (!media) {
      const match = method.name.match(/ (19[5-9]\d|20\d{2})/)
      if (match) {
        method.name = method.name.replace(/ (19[5-9]\d|20\d{2})/, '')
        media = (await alRequest(method)).data.Page.media[0]
      }
    }
  } catch (e) { }

  if (media) relations[name] = media
}

function getParseObjTitle (obj) {
  let title = obj.anime_title
  if (obj.anime_season) title += ' S' + obj.anime_season
  return title
}

export async function resolveFileMedia (opts) {
  // opts.fileName
  const parsePromises = opts.fileName.constructor === Array
    ? opts.fileName.map(name => anitomyscript(name))
    : [anitomyscript(opts.fileName)]
  const parseObjs = await Promise.all(parsePromises)
  // batches promises in 10 at a time, because of CF burst protection, which still sometimes gets triggered :/
  await PromiseBatch(resolveTitle, [...new Set(parseObjs.map(obj => getParseObjTitle(obj)))].filter(title => !(title in relations)), 10)
  const fileMedias = []
  for (const parseObj of parseObjs) {
    let failed = false
    let episode
    let media = relations[getParseObjTitle(parseObj)]
    // resolve episode, if movie, dont.
    const maxep = media?.nextAiringEpisode?.episode || media?.episodes
    if ((media?.format !== 'MOVIE' || maxep) && parseObj.episode_number) {
      if (parseObj.episode_number.constructor === Array) {
        // is an episode range
        if (parseInt(parseObj.episode_number[0]) === 1) {
          // if it starts with #1 and overflows then it includes more than 1 season in a batch, cant fix this cleanly, name is parsed per file basis so this shouldnt be an issue
          episode = `${parseObj.episode_number[0]} ~ ${parseObj.episode_number[1]}`
        } else {
          if (maxep && parseInt(parseObj.episode_number[1]) > maxep) {
            // get root media to start at S1, instead of S2 or some OVA due to parsing errors
            // this is most likely safe, if it was relative episodes then it would likely use an accurate title for the season
            // if they didnt use an accurate title then its likely an absolute numbering scheme
            // parent check is to break out of those incorrectly resolved OVA's
            const prequel = findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && findEdge(media, 'PARENT')?.node)
            const root = prequel && (await resolveSeason({ media: (await alRequest({ method: 'SearchIDSingle', id: prequel.id })).data.Media, force: true })).media

            // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
            const result = await resolveSeason({ media: root || media, episode: parseObj.episode_number[1] })
            media = result.rootMedia
            const diff = parseObj.episode_number[1] - result.episode
            episode = `${parseObj.episode_number[0] - diff} ~ ${result.episode}`
            failed = result.failed
          } else {
            // cant find ep count or range seems fine
            episode = `${Number(parseObj.episode_number[0])} ~ ${Number(parseObj.episode_number[1])}`
          }
        }
      } else {
        if (maxep && parseInt(parseObj.episode_number) > maxep) {
          // see big comment above
          const prequel = findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && findEdge(media, 'PARENT')?.node)
          const root = prequel && (await resolveSeason({ media: (await alRequest({ method: 'SearchIDSingle', id: prequel.id })).data.Media, force: true })).media

          // value bigger than episode count
          const result = await resolveSeason({ media: root || media, episode: parseInt(parseObj.episode_number) })
          media = result.rootMedia
          episode = result.episode
          failed = result.failed
        } else {
          // cant find ep count or episode seems fine
          episode = Number(parseObj.episode_number)
        }
      }
    }
    const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(parseObj.episode_number))[0]
    fileMedias.push({
      mediaTitle: media?.title.userPreferred || parseObj.anime_title,
      episodeNumber: episode || parseObj.episode_number,
      episodeTitle: streamingEpisode && episodeRx.exec(streamingEpisode.title)[2],
      episodeThumbnail: streamingEpisode?.thumbnail,
      mediaCover: media?.coverImage.medium,
      name: 'Miru',
      parseObject: parseObj,
      media,
      failed
    })
  }
  return fileMedias.length === 1 ? fileMedias[0] : fileMedias
}

export function findEdge (media, type, formats = ['TV', 'TV_SHORT'], skip) {
  const res = media.relations.edges.find(edge => {
    if (edge.relationType === type) {
      return formats.includes(edge.node.format)
    }
    return false
  })
  // this is hit-miss
  // if (!res && !skip) res = findEdge(media, type, formats = ['TV', 'TV_SHORT', 'MOVIE'], true)
  return res
}

// note: this doesnt cover anime which uses partially relative and partially absolute episode number, BUT IT COULD!
export async function resolveSeason (opts) {
  // media, episode, increment, offset, force
  if (!opts.media || !(opts.episode || opts.force)) throw new Error('No episode or media for season resolve!')

  let { media, episode, increment, offset = 0, rootMedia = opts.media, force } = opts

  const rootHighest = (rootMedia.nextAiringEpisode?.episode || rootMedia.episodes)

  const prequel = !increment && findEdge(media, 'PREQUEL')?.node
  const sequel = !prequel && (increment || increment == null) && findEdge(media, 'SEQUEL')?.node
  const edge = prequel || sequel
  increment = increment ?? !prequel

  if (!edge) {
    const obj = { media, episode: episode - offset, offset, increment, rootMedia, failed: true }
    if (!force) {
      console.warn('Error in parsing!', obj)
      addToast({
        text: `Failed resolving anime episode!<br>${media.title.userPreferred} - ${episode - offset}`,
        title: 'Parsing Error',
        type: 'secondary'
      })
    }
    return obj
  }
  media = (await alRequest({ method: 'SearchIDSingle', id: edge.id })).data.Media

  const highest = media.nextAiringEpisode?.episode || media.episodes

  const diff = episode - (highest + offset)
  offset += increment ? rootHighest : highest
  if (increment) rootMedia = media

  // force marches till end of tree, no need for checks
  if (!force && diff <= rootHighest) {
    episode -= offset
    return { media, episode, offset, increment, rootMedia }
  }

  return resolveSeason({ media, episode, increment, offset, rootMedia, force })
}

const relations = {}
