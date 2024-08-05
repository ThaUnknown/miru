import { anilistClient } from './anilist.js'
import { anitomyscript } from './anime.js'
import { chunks } from './util.js'

const postfix = {
  1: 'st', 2: 'nd', 3: 'rd'
}

export default new class AnimeResolver {
  // name: media cache from title resolving
  animeNameCache = {}

  /**
   * @param {import('anitomyscript').AnitomyResult} obj
   * @returns {string}
   */
  getCacheKeyForTitle (obj) {
    let key = obj.anime_title
    if (obj.anime_year) key += obj.anime_year
    return key
  }

  /**
   * @param {string} title
   * @returns {string[]}
   */
  alternativeTitles (title) {
    const titles = new Set()

    let modified = title
    // preemptively change S2 into Season 2 or 2nd Season, otherwise this will have accuracy issues
    const seasonMatch = title.match(/ S(\d+)/)
    if (seasonMatch) {
      if (Number(seasonMatch[1]) === 1) { // if this is S1, remove the " S1" or " S01"
        modified = title.replace(/ S(\d+)/, '')
        titles.add(modified)
      } else {
        modified = title.replace(/ S(\d+)/, ` ${Number(seasonMatch[1])}${postfix[Number(seasonMatch[1])] || 'th'} Season`)
        titles.add(modified)
        titles.add(title.replace(/ S(\d+)/, ` Season ${Number(seasonMatch[1])}`))
      }
    } else {
      titles.add(title)
    }

    // remove - :
    const specialMatch = modified.match(/[-:]/g)
    if (specialMatch) {
      modified = modified.replace(/[-:]/g, '').replace(/[ ]{2,}/, ' ')
      titles.add(modified)
    }

    // remove (TV)
    const tvMatch = modified.match(/\(TV\)/)
    if (tvMatch) {
      modified = modified.replace('(TV)', '')
      titles.add(modified)
    }

    return [...titles]
  }

  /**
   * resolve anime name based on file name and store it
   * @param {import('anitomyscript').AnitomyResult[]} parseObjects
   */
  async findAnimesByTitle (parseObjects) {
    if (!parseObjects.length) return
    const titleObjects = parseObjects.map(obj => {
      const key = this.getCacheKeyForTitle(obj)
      const titleObjects = this.alternativeTitles(obj.anime_title).map(title => ({ title, year: obj.anime_year, key, isAdult: false }))
      titleObjects.push({ ...titleObjects.at(-1), isAdult: true })
      return titleObjects
    }).flat()

    for (const chunk of chunks(titleObjects, 62)) { // single title has a complexity of 8.1, al limits complexity to 500
      for (const [key, media] of await anilistClient.alSearchCompound(chunk)) {
        this.animeNameCache[key] = media
      }
    }
  }

  /**
   * @param {number} id
   */
  async getAnimeById (id) {
    if (anilistClient.mediaCache[id]) return anilistClient.mediaCache[id]
    const res = await anilistClient.searchIDSingle({ id })

    return res.data.Media
  }

  // TODO: anidb aka true episodes need to be mapped to anilist episodes a bit better, shit like mushoku offsets caused by episode 0's in between seasons
  /**
   * @param {string | string[]} fileName
   * @returns {Promise<any[]>}
   */
  async resolveFileAnime (fileName) {
    if (!fileName) return [{}]
    const parseObjs = await anitomyscript(fileName)

    const TYPE_EXCLUSIONS = ['ED', 'ENDING', 'NCED', 'NCOP', 'OP', 'OPENING', 'PREVIEW', 'PV']

    /** @type {Record<string, import('anitomyscript').AnitomyResult>} */
    const uniq = {}
    for (const obj of parseObjs) {
      const key = this.getCacheKeyForTitle(obj)
      if (key in this.animeNameCache) continue // skip already resolved
      if (obj.anime_type && TYPE_EXCLUSIONS.includes(obj.anime_type.toUpperCase())) continue // skip non-episode media
      uniq[key] = obj
    }
    await this.findAnimesByTitle(Object.values(uniq))

    const fileAnimes = []
    for (const parseObj of parseObjs) {
      let failed = false
      let episode
      let media = this.animeNameCache[this.getCacheKeyForTitle(parseObj)]
      // resolve episode, if movie, dont.
      const maxep = media?.nextAiringEpisode?.episode || media?.episodes
      if ((media?.format !== 'MOVIE' || maxep) && parseObj.episode_number) {
        if (Array.isArray(parseObj.episode_number)) {
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
              // if we used anime season to resolve anime name, then there's no need to march into prequel!
              const prequel = !parseObj.anime_season && (this.findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && this.findEdge(media, 'PARENT')?.node))
              const root = prequel && (await this.resolveSeason({ media: await this.getAnimeById(prequel.id), force: true })).media

              // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
              const result = await this.resolveSeason({ media: root || media, episode: parseObj.episode_number[1], increment: !parseObj.anime_season ? null : true })
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
            const prequel = !parseObj.anime_season && (this.findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && this.findEdge(media, 'PARENT')?.node))
            const root = prequel && (await this.resolveSeason({ media: await this.getAnimeById(prequel.id), force: true })).media

            // value bigger than episode count
            const result = await this.resolveSeason({ media: root || media, episode: parseInt(parseObj.episode_number), increment: !parseObj.anime_season ? null : true })
            media = result.rootMedia
            episode = result.episode
            failed = result.failed
          } else {
            // cant find ep count or episode seems fine
            episode = Number(parseObj.episode_number)
          }
        }
      }
      fileAnimes.push({
        episode: episode || parseObj.episode_number,
        parseObject: parseObj,
        media,
        failed
      })
    }
    return fileAnimes
  }

  findEdge (media, type, formats = ['TV', 'TV_SHORT'], skip) {
    let res = media.relations.edges.find(edge => {
      if (edge.relationType === type) {
        return formats.includes(edge.node.format)
      }
      return false
    })
    // this is hit-miss
    if (!res && !skip && type === 'SEQUEL') res = this.findEdge(media, type, formats = ['TV', 'TV_SHORT', 'OVA'], true)
    return res
  }

  // note: this doesnt cover anime which uses partially relative and partially absolute episode number, BUT IT COULD!
  /**
   *
   * @param {{ media:any, episode?:number, force?:boolean, increment?:boolean, offset?: number, rootMedia?:any }} opts
   * @returns
   */
  async resolveSeason (opts) {
    // media, episode, increment, offset, force
    if (!opts.media || !(opts.episode || opts.force)) throw new Error('No episode or media for season resolve!')

    let { media, episode, increment, offset = 0, rootMedia = opts.media, force } = opts

    const rootHighest = (rootMedia.nextAiringEpisode?.episode || rootMedia.episodes)

    const prequel = !increment && this.findEdge(media, 'PREQUEL')?.node
    const sequel = !prequel && (increment || increment == null) && this.findEdge(media, 'SEQUEL')?.node
    const edge = prequel || sequel
    increment = increment ?? !prequel

    if (!edge) {
      const obj = { media, episode: episode - offset, offset, increment, rootMedia, failed: true }
      if (!force) console.warn('Error in parsing!', obj)
      return obj
    }
    media = await this.getAnimeById(edge.id)

    const highest = media.nextAiringEpisode?.episode || media.episodes

    const diff = episode - (highest + offset)
    offset += increment ? rootHighest : highest
    if (increment) rootMedia = media

    // force marches till end of tree, no need for checks
    if (!force && diff <= rootHighest) {
      episode -= offset
      return { media, episode, offset, increment, rootMedia }
    }

    return this.resolveSeason({ media, episode, increment, offset, rootMedia, force })
  }
}()
