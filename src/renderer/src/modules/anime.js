import { add } from './torrent.js'
import { DOMPARSER } from './util.js'
import { alRequest } from './anilist.js'
import anitomyscript from 'anitomyscript'
import { addToast } from '@/lib/Toasts.svelte'
import { view } from '@/App.svelte'

const torrentRx = /(^magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent$){1}/i
const imageRx = /\.(jpeg|jpg|gif|png|webp)/i

fetch('https://nyaa.si').catch(() => {
  addToast({
    text: 'Failed connecting to Nyaa!<br>Visit https://wiki.piracy.moe/en/tutorials/unblock<br>for a guide on how to bypass ISP blocks.',
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

export async function resolveFileMedia (opts) {
  // opts.fileName opts.isRelease

  async function resolveTitle (title) {
    if (!(title in relations)) {
      // resolve name and shit
      const method = { name: title, method: 'SearchName', perPage: 1, status: ['RELEASING'], sort: 'SEARCH_MATCH', startDate: 10000000 }
      let res = await alRequest(method)
      if (!res.data.Page.media[0]) {
        const index = method.name.search(/S\d/)
        method.name = ((index !== -1 && method.name.slice(0, index) + method.name.slice(index + 1, method.name.length)) || method.name).replace('(TV)', '').replace(/ (19[5-9]\d|20[0-6]\d)/, '').replace('-', '')
        method.status = ['RELEASING', 'FINISHED']
        res = await alRequest(method)
      }
      if (res.data.Page.media[0]) {
        relations[title] = res.data.Page.media[0].id
      } else {
        relations[title] = null
      }
    }
  }
  const parsePromises = opts.fileName.constructor === Array
    ? opts.fileName.map(name => anitomyscript(name))
    : [anitomyscript(opts.fileName)]
  const parseObjs = await Promise.all(parsePromises)
  await Promise.all([...new Set(parseObjs.map(obj => obj.anime_title))].map(title => resolveTitle(title)))
  const assoc = {}
  for (let ids = [...new Set(parseObjs.map(obj => relations[obj.anime_title]))]; ids.length; ids = ids.slice(50)) {
    for await (const media of (await alRequest({ method: 'SearchIDS', id: ids.slice(0, 50), perPage: 50 })).data.Page.media) {
      assoc[media.id] = media
    }
  }
  const fileMedias = []
  for (const praseObj of parseObjs) {
    let episode
    let media = assoc[relations[praseObj.anime_title]]
    async function resolveSeason (opts) {
      // opts.media, opts.episode, opts.increment, opts.offset
      let epMin, epMax
      if (opts.episode.constructor === Array) { // support batch episode ranges
        epMin = Number(opts.episode[0])
        epMax = Number(opts.episode[opts.episode.length - 1])
      } else {
        epMin = epMax = Number(opts.episode)
      }
      let tempMedia, increment
      if (opts.media.relations.edges.some(edge => edge.relationType === 'PREQUEL' && (edge.node.format === 'TV' || 'TV_SHORT')) && !opts.increment) {
        // media has prequel and we dont want to move up in the tree
        tempMedia = opts.media.relations.edges.filter(edge => edge.relationType === 'PREQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))[0].node
      } else if (opts.media.relations.edges.some(edge => edge.relationType === 'SEQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))) {
        // media doesnt have prequel, or we want to move up in the tree
        tempMedia = opts.media.relations.edges.filter(edge => edge.relationType === 'SEQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))[0].node
        increment = true
      }
      if (tempMedia?.episodes && epMax - (opts.offset + media.episodes) > (media.nextAiringEpisode?.episode || media.episodes)) {
        // episode is still out of bounds
        const nextEdge = await alRequest({ method: 'SearchIDSingle', id: tempMedia.id })
        await resolveSeason({ media: nextEdge.data.Media, episode: opts.episode, offset: opts.offset + nextEdge.data.Media.episodes, increment: increment })
      } else if (tempMedia?.episodes && epMax - (opts.offset + media.episodes) <= (media.nextAiringEpisode?.episode || media.episodes) && epMin - (opts.offset + media.episodes) > 0) {
        // episode is in range, seems good! overwriting media to count up "seasons"
        if (opts.episode.constructor === Array) {
          episode = `${praseObj.episode_number[0] - (opts.offset + media.episodes)} ~ ${praseObj.episode_number[praseObj.episode_number.length - 1] - (opts.offset + media.episodes)}`
        } else {
          episode = opts.episode - (opts.offset + media.episodes)
        }
        if (opts.increment || increment) {
          const nextEdge = await alRequest({ method: 'SearchIDSingle', id: tempMedia.id })
          media = nextEdge.data.Media
        }
      } else {
        console.log('error in parsing!', opts.media, tempMedia)
        addToast({
          text: `Failed resolving anime episode!<br>${opts.media.title.userPreferred} - ${epMax}`,
          title: 'Parsing Error',
          type: 'secondary'
        })
        // something failed, most likely couldnt find an edge or processing failed, force episode number even if its invalid/out of bounds, better than nothing
        if (opts.episode.constructor === Array) {
          episode = `${Number(praseObj.episode_number[0])} ~ ${Number(praseObj.episode_number[praseObj.episode_number.length - 1])}`
        } else {
          episode = Number(opts.episode)
        }
      }
    }

    // resolve episode, if movie, dont.
    if ((media?.format !== 'MOVIE' || (media.episodes || media.nextAiringEpisode.episode)) && praseObj.episode_number) {
      if (praseObj.episode_number.constructor === Array) {
        // is an episode range
        if (parseInt(praseObj.episode_number[0]) === 1) {
          // if it starts with #1 and overflows then it includes more than 1 season in a batch, cant fix this cleanly, name is parsed per file basis so this shouldnt be an issue
          episode = `${praseObj.episode_number[0]} ~ ${praseObj.episode_number[praseObj.episode_number.length - 1]}`
        } else {
          if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(praseObj.episode_number[praseObj.episode_number.length - 1]) > (media.episodes || media.nextAiringEpisode.episode)) {
            // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
            await resolveSeason({ media: media, episode: praseObj.episode_number, offset: 0 })
          } else {
            // cant find ep count or range seems fine
            episode = `${Number(praseObj.episode_number[0])} ~ ${Number(praseObj.episode_number[praseObj.episode_number.length - 1])}`
          }
        }
      } else {
        if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(praseObj.episode_number) > (media.episodes || media.nextAiringEpisode.episode)) {
          // value bigger than episode count
          await resolveSeason({ media: media, episode: praseObj.episode_number, offset: 0 })
        } else {
          // cant find ep count or episode seems fine
          episode = Number(praseObj.episode_number)
        }
      }
    }
    const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(praseObj.episode_number))[0]
    fileMedias.push({
      mediaTitle: media?.title.userPreferred,
      episodeNumber: episode,
      episodeTitle: streamingEpisode && episodeRx.exec(streamingEpisode.title)[2],
      episodeThumbnail: streamingEpisode?.thumbnail,
      mediaCover: media?.coverImage.medium,
      name: 'Miru',
      parseObject: praseObj,
      media: media
    })
  }
  return fileMedias.length === 1 ? fileMedias[0] : fileMedias
}

export const relations = JSON.parse(localStorage.getItem('relations')) || {}
