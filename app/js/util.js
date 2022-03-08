import halfmoon from 'halfmoon'

halfmoon.showModal = id => {
  const t = document.getElementById(id)
  t && t.classList.add('show')
}

halfmoon.hideModal = id => {
  const t = document.getElementById(id)
  t && t.classList.remove('show')
}

export const searchParams = new URLSearchParams(location.href)
if (searchParams.get('access_token')) {
  localStorage.setItem('ALtoken', searchParams.get('access_token'))
  window.location = '/app/#home'
}

export const userBrowser = (() => {
  if (window.chrome) {
    return (navigator.userAgent.indexOf('Edg') !== -1) ? 'edge' : 'chromium'
  }
  return 'firefox'
})()

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

export function flattenObj (obj) {
  const result = {}

  for (const key in obj) {
    if (obj[key] && obj[key].constructor === Object) {
      const childObj = flattenObj(obj[key])

      for (const childObjKey in childObj) {
        result[childObjKey] = childObj[childObjKey]
      }
    } else {
      result[key] = obj[key]
    }
  }
  return result
}

export const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())

export function concat (chunks, size) {
  if (!size) {
    size = 0
    let i = chunks.length || chunks.byteLength || 0
    while (i--) size += chunks[i].length
  }
  const b = new Uint8Array(size)
  let offset = 0
  for (let i = 0, l = chunks.length; i < l; i++) {
    const chunk = chunks[i]
    b.set(chunk, offset)
    offset += chunk.byteLength || chunk.length
  }

  return b
}

export const sleep = t => new Promise(resolve => setTimeout(resolve, t))

export class Queue {
  constructor () {
    this.queue = []
    this.destroyed = false
    this.lastfn = null
  }

  add (obj) { // index, fn
    if (this.destroyed) return
    // most common case, requests are in order
    // also push to the end of queue if there's an outstanding high range request [for example EOF metadata]
    // this impacts backwards seeking performance a bit, but is needed for metadata
    if (!this.queue.length || obj.index > this.queue[this.queue.length - 1].index || obj.index < this.queue[0].index - 10) {
      this.queue.push(obj)
      if (this.queue.length === 1) this._next()
    } else {
      // otherwise if one request failed its likely the oldest, or older one, so iterate backwards [forwards since queue is reversed]
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].index > obj.index) {
          this.queue.splice(i, 0, obj)
          return
        }
      }
      this.queue.push(obj)
      console.warn('got bad')
    }
  }

  async _next () {
    const obj = this.queue[0]
    await obj.fn()
    this._remove(obj)
    if (!this.destroyed && this.queue.length) this._next()
  }

  _remove (obj) {
    if (!this.destroyed) this.queue.splice(this.queue.indexOf(obj), 1)
  }

  destroy () {
    this.destroyed = true
    this.queue = null
  }
}
