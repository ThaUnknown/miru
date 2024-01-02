import { fastPrettyBytes } from '../util.js'

export default async function (media) {
  const res = await fetch(`https://beta.releases.moe/api/collections/entries/records?page=1&perPage=1&filter=alID%3D%22${media.id}%22&skipTotal=1&expand=trs`)
  const { items } = await res.json()

  if (!items[0]?.expand?.trs?.length) return []

  const { trs } = items[0]?.expand

  return trs.filter(({ infoHash }) => infoHash !== '<redacted>').map(torrent => {
    return {
      hash: torrent.infoHash,
      link: torrent.infoHash,
      title: `[${torrent.releaseGroup}] ${media.title.userPreferred}`,
      size: fastPrettyBytes(torrent.files.reduce((prev, curr) => prev + curr.length, 0)),
      type: torrent.isBest ? 'best' : 'alt',
      date: new Date(torrent.created),
      parseObject: {
        audio_term: [torrent.dualAudio && 'DUALAUDIO']
      }
    }
  })
}
