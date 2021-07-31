/* eslint-env browser */
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
  window.location = '/app/#settingsTab'
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

export const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())
