import { binarySearch } from '../util.js'

let seadex = []
requestIdleCallback(async () => {
  const res = await fetch('https://sneedex.moe/api/public/nyaa')
  const json = await res.json()
  seadex = json.flatMap(({ nyaaIDs }) => nyaaIDs).sort((a, b) => a - b) // sort for binary search
})

export default function (entries) {
  return entries.map(entry => {
    if (entry.id) {
      if (entry.id === '?') return entry
      if (binarySearch(seadex, entry.id)) entry.type = 'alt'
      return entry
    }
    const match = entry.link.match(/\d+/i)
    if (match && binarySearch(seadex, Number(match[0]))) entry.type = 'alt'
    return entry
  })
}
