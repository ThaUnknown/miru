/* eslint-env browser */
/* global torrent4list */

import { settings } from './settings.js'
import { releasesCards } from './interface.js'
import { userBrowser, DOMPARSER } from './util.js'
import { client } from './main.js'
import halfmoon from 'halfmoon'

const exclusions = {
  edge: ['DTS'],
  chromium: ['DTS', 'AC3', 'HEVC', 'x265', 'H.265'],
  firefox: ['DTS', 'AC3', 'HEVC', 'x265', 'H.265', '.3gp', '.mkv']
}
if (!('audioTracks' in HTMLVideoElement.prototype)) {
  exclusions[userBrowser].push('mutli audio', 'dual audio')
}

export async function nyaaRss (media, episode) {
  const frag = document.createDocumentFragment()
  const ep = (media.status === 'FINISHED' && settings.torrent9) ? `"01-${media.episodes}"|"01~${media.episodes}"|"Batch"|"Complete"|"+${episode}+"|"+${episode}v"` : `"+${episode}+"|"+${episode}v"`
  const url = new URL(`https://meowinjapanese.cf/?page=rss&c=1_2&f=${settings.torrent3 === true ? 2 : 0}&s=seeders&o=desc&q=(${[...new Set(Object.values(media.title).concat(media.synonyms).filter(name => name != null))].join(')|(')})${ep}"${settings.torrent1}"-(${exclusions[userBrowser].join('|')})`)
  await fetch(url).then(res => {
    res.text().then((xmlTxt) => {
      try {
        const doc = DOMPARSER(xmlTxt, 'text/xml')
        if (settings.torrent2 && doc.querySelector('infoHash')) {
          client.playTorrent(doc.querySelector('infoHash').textContent, { media: media, episode: episode })
          halfmoon.toggleModal('tsearch')
        }
        doc.querySelectorAll('item').forEach((item, index) => {
          const i = item.querySelectorAll('*')
          const template = document.createElement('tr')
          template.innerHTML += `
                <th>${(index + 1)}</th>
                <td>${i[0].textContent}</td>
                <td>${i[10].textContent}</td>
                <td>${i[4].textContent}</td>
                <td>${i[5].textContent}</td>
                <td>${i[6].textContent}</td>
                <td class="pointer">Play</td>`
          template.onclick = () => {
            client.playTorrent(i[7].textContent, { media: media, episode: episode })
            halfmoon.hideModal('tsearch')
          }
          frag.appendChild(template)
        })
      } catch (e) {
        console.error(e)
      }
    })
  })
  return frag
}

export async function releasesRss (limit) {
  return await fetch(getRSSurl()).then(res => res.text().then(async xmlTxt => {
    return await releasesCards(DOMPARSER(xmlTxt, 'text/xml').querySelectorAll('item'), limit)
  }))
}

export function getRSSurl () {
  if (Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0]) {
    return settings.torrent4 === 'Erai-raws' ? new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].innerHTML + settings.torrent1 + '-magnet') : new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].innerHTML + settings.torrent1)
  } else {
    return settings.torrent4 + settings.torrent1 // add custom RSS
  }
}
