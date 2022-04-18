export function countdown (s) {
  const d = Math.floor(s / (3600 * 24))
  s -= d * 3600 * 24
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const tmp = []
  if (d) tmp.push(d + 'd')
  if (d || h) tmp.push(h + 'h')
  if (d || h || m) tmp.push(m + 'm')
  return tmp.join(' ')
}

const units = [' B', ' kB', ' MB', ' GB', ' TB']
export function fastPrettyBytes (num) {
  if (isNaN(num)) return '0 B'
  if (num < 1) return num + ' B'
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  return Number((num / Math.pow(1000, exponent)).toFixed(2)) + units[exponent]
}

export const DOMPARSER = DOMParser.prototype.parseFromString.bind(new DOMParser())

export const sleep = t => new Promise(resolve => setTimeout(resolve, t))

export const videoExtensions = ['3g2', '3gp', 'asf', 'avi', 'dv', 'flv', 'gxf', 'm2ts', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'mkv', 'mov', 'mp4', 'mpd', 'mpeg', 'mpg', 'mxf', 'nut', 'ogm', 'ogv', 'swf', 'ts', 'vob', 'webm', 'wmv', 'wtv']
export const videoRx = new RegExp(`.(${videoExtensions.join('|')})$`, 'i')

export const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt']
export const subRx = new RegExp(`.(${subtitleExtensions.join('|')})$`, 'i')

export function toTS (sec, full) {
  if (isNaN(sec) || sec < 0) {
    switch (full) {
      case 1:
        return '0:00:00.00'
      case 2:
        return '0:00:00'
      case 3:
        return '00:00'
      default:
        return '0:00'
    }
  }
  const hours = Math.floor(sec / 3600)
  let minutes = Math.floor(sec / 60) - hours * 60
  let seconds = full === 1 ? (sec % 60).toFixed(2) : Math.floor(sec % 60)
  if (minutes < 10 && (hours > 0 || full)) minutes = '0' + minutes
  if (seconds < 10) seconds = '0' + seconds
  return (hours > 0 || full === 1 || full === 2) ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds
}

export async function PromiseBatch (task, items, batchSize) {
  let position = 0
  let results = []
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize)
    results = [...results, ...await Promise.all(itemsForBatch.map(item => task(item)))]
    position += batchSize
  }
  return results
}

export function generateRandomHexCode (len) {
  let hexCode = ''

  while (hexCode.length < len) {
    hexCode += (Math.round(Math.random() * 15)).toString(16)
  }

  return hexCode
}
