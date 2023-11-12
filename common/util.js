export const defaults = {
  playerAutoplay: true,
  playerPause: true,
  playerAutocomplete: true,
  rssQuality: '1080',
  rssFeedsNew: [['New Releases', 'SubsPlease']],
  rssAutoplay: true,
  torrentSpeed: 10,
  torrentPersist: false,
  torrentDHT: false,
  torrentPeX: false,
  torrentPort: 0,
  dhtPort: 0,
  missingFont: true,
  maxConns: 20,
  subtitleLanguage: 'eng',
  audioLanguage: 'jpn',
  enableDoH: false,
  doHURL: 'https://cloudflare-dns.com/dns-query',
  disableSubtitleBlur: false,
  toshoURL: decodeURIComponent(atob('aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3JnLw==')),
  showDetailsInRPC: true,
  smoothScroll: true,
  cards: 'small',
  expandingSidebar: true,
  torrentPath: undefined,
  font: undefined,
  angle: 'default'
}

export const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt']
export const subRx = new RegExp(`.(${subtitleExtensions.join('|')})$`, 'i')

export const videoExtensions = ['3g2', '3gp', 'asf', 'avi', 'dv', 'flv', 'gxf', 'm2ts', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'mkv', 'mov', 'mp4', 'mpd', 'mpeg', 'mpg', 'mxf', 'nut', 'ogm', 'ogv', 'swf', 'ts', 'vob', 'webm', 'wmv', 'wtv']
export const videoRx = new RegExp(`.(${videoExtensions.join('|')})$`, 'i')

// freetype supported
export const fontExtensions = ['ttf', 'ttc', 'woff', 'woff2', 'otf', 'cff', 'otc', 'pfa', 'pfb', 'pcf', 'fnt', 'bdf', 'pfr', 'eot']
export const fontRx = new RegExp(`.(${fontExtensions.join('|')})$`, 'i')
