import { alRequest } from '@/modules/anilist.js'
import { set } from '@/views/Settings.svelte'
import { findEdge, resolveSeason, getMediaMaxEp, mapBestRelease } from '../anime.js'
import { exclusions, getRSSContent, parseRSSNodes } from '../rss.js'

export default async function getRSSEntries ({ media, episode, mode, ignoreQuality }) {
  // mode cuts down on the amt of queries made 'check' || 'batch'
  const titles = createTitle(media).join(')|(')

  const prequel = findEdge(media, 'PREQUEL')?.node
  const sequel = findEdge(media, 'SEQUEL')?.node
  const isBatch = media.status === 'FINISHED' && media.episodes !== 1

  // if media has multiple seasons, and this S is > 1, then get the absolute episode number of the episode
  const absolute = prequel && !mode && (await resolveSeason({ media, episode, force: true }))
  const absoluteep = absolute?.offset + episode
  const episodes = [episode]

  // only use absolute episode number if its smaller than max episodes this series has, ex:
  // looking for E1 of S2, S1 has 12 ep and S2 has 13, absolute will be 13
  // so this would find the 13th ep of the 2nd season too if this check wasnt here
  if (absolute && absoluteep < (getMediaMaxEp(media) || episode)) {
    episodes.push(absoluteep)
  }

  let ep = ''
  if (media.episodes !== 1 && mode !== 'batch') {
    if (isBatch) {
      const digits = Math.max(2, Math.log(media.episodes) * Math.LOG10E + 1 | 0)
      ep = `"${zeropad(1, digits)}-${zeropad(media.episodes, digits)}"|"${zeropad(1, digits)}~${zeropad(media.episodes, digits)}"|"Batch"|"Complete"|"${zeropad(episode)}+"|"${zeropad(episode)}v"`
    } else {
      ep = `(${episodes.map(epstring).join('|')})`
    }
  }

  const excl = exclusions.join('|')
  const quality = (!ignoreQuality && (`"${set.rssQuality}"` || '"1080"')) || ''
  const url = new URL(`${set.catURL}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

  let nodes = [...(await getRSSContent(url)).querySelectorAll('item')]

  if (absolute) {
    // if this is S > 1 aka absolute ep number exists get entries for S1title + absoluteEP
    // the reason this isnt done with recursion like sequelEntries is because that would include the S1 media dates
    // we want the dates of the target media as the S1 title might be used for SX releases
    const titles = createTitle(absolute.media).join(')|(')

    const url = new URL(`${set.catURL}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${epstring(absoluteep)}${quality}-(${excl})`)
    nodes = [...nodes, ...(await getRSSContent(url)).querySelectorAll('item')]
  }

  let entries = parseRSSNodes(nodes)

  const checkSequelDate = media.status === 'FINISHED' && (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') && sequel.startDate

  const sequelStartDate = checkSequelDate && new Date(Object.values(checkSequelDate).join(' '))

  // recursive, get all entries for media sequel, and its sequel, and its sequel
  const sequelEntries =
      (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') &&
        (await getRSSEntries({ media: (await alRequest({ method: 'SearchIDSingle', id: sequel.id })).data.Media, episode, mode: mode || 'check' }))

  const checkPrequelDate = (media.status === 'FINISHED' || media.status === 'RELEASING') && prequel?.status === 'FINISHED' && prequel?.endDate

  const prequelEndDate = checkPrequelDate && new Date(Object.values(checkPrequelDate).join(' '))

  // 1 month in MS, a bit of jitter for pre-releases and releasers being late as fuck, lets hope it doesnt cause issues
  const month = 2674848460

  if (prequelEndDate) {
    entries = entries.filter(entry => entry.date > new Date(+prequelEndDate + month))
  }

  if (sequelStartDate && media.format === 'TV') {
    entries = entries.filter(entry => entry.date < new Date(+sequelStartDate - month))
  }

  if (sequelEntries?.length) {
    if (mode === 'check') {
      entries = [...entries, ...sequelEntries]
    } else {
      entries = entries.filter(entry => !sequelEntries.find(sequel => sequel.link === entry.link))
    }
  }

  // this gets entries without any episode limiting, and for batches
  const batchEntries = !mode && isBatch && (await getRSSEntries({ media, episode, ignoreQuality, mode: 'batch' })).filter(entry => {
    return !epNumRx.test(entry.title)
  })

  if (batchEntries?.length) {
    entries = [...entries, ...batchEntries]
  }

  // some archaic shows only have shit DVD's in weird qualities, so try to look up without any quality restrictions when there are no results
  if (!entries.length && !ignoreQuality && !mode) {
    entries = await getRSSEntries({ media, episode, ignoreQuality: true })
  }

  // dedupe
  const ids = entries.map(e => e.link)
  return mapBestRelease(entries.filter(({ link }, index) => !ids.includes(link, index + 1)))
}

// padleft a variable with 0 ex: 1 => '01'
function zeropad (v = 1, l = 2) {
  return (typeof v === 'string' ? v : v.toString()).padStart(l, '0')
}

const epstring = ep => `"E${zeropad(ep)}+"|"E${zeropad(ep)}v"|"+${zeropad(ep)}+"|"+${zeropad(ep)}v"`
// [EO]?[-EPD _—]\d{2}(?:[-v _.—]|$)
// /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i
// matches: OP01 ED01 EP01 E01 01v 01. -01- _01_ with spaces and stuff
const epNumRx = /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i

// create an array of potentially valid titles from a given media
function createTitle (media) {
  // group and de-duplicate
  const grouped = [
    ...new Set(
      Object.values(media.title)
        .concat(media.synonyms)
        .filter(name => name != null && name.length > 3)
    )
  ]
  const titles = []
  const appendTitle = t => {
    // replace & with encoded
    const title = t.replace(/&/g, '%26').replace(/\?/g, '%3F').replace(/#/g, '%23')
    titles.push(title)

    // replace Season 2 with S2, else replace 2nd Season with S2, but keep the original title
    const match1 = title.match(/(\d)(?:nd|rd|th) Season/i)
    const match2 = title.match(/Season (\d)/i)

    if (match2) {
      titles.push(title.replace(/Season \d/i, `S${match2[1]}`))
    } else if (match1) {
      titles.push(title.replace(/(\d)(?:nd|rd|th) Season/i, `S${match1[1]}`))
    }
  }
  for (const t of grouped) {
    appendTitle(t)
    if (t.includes('-')) appendTitle(t.replaceAll('-', ''))
  }
  return titles
}
