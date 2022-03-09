/* global halfmoon */
halfmoon.showModal = id => {
  const t = document.getElementById(id)
  t && t.classList.add('show')
}

halfmoon.hideModal = id => {
  const t = document.getElementById(id)
  t && t.classList.remove('show')
}

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

export const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())

export const sleep = t => new Promise(resolve => setTimeout(resolve, t))
