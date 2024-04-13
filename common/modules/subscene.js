import ky from 'ky'
import $ from 'jquery'
import zip from 'jszip'

const retryOptions = {
  limit: 10,
  methods: ['post', 'get'],
  statusCodes: [409, 408, 413, 429, 500, 502, 503, 504],
  backoffLimit: 1000
}

export async function subsceneSearch (query) {
  const res = await ky.post('https://subscene.com/subtitles/searchbytitle/', {
    json: { query },
    retry: retryOptions
  })
  const html = $(await res.text())
  const results = []
  const resultElems = $('.search-result ul a', html)
  for (let i = 0; i < resultElems.length; i++) {
    const el = $(resultElems[i])
    const path = el.attr('href')
    const title = el.text()
    if (results.some(result => result.path === path)) continue
    results.push({ path, title })
  }
  console.log(results)
  return results
}

export async function subsceneSubs (path) {
  const res = await ky.get('https://subscene.com' + path, {
    retry: retryOptions
  })
  const html = $(await res.text())
  const subtitles = {}
  const subElems = $('table tr .a1 a', html)
  for (let i = 0; i < subElems.length; i++) {
    const el = $(subElems[i])
    const path = el.attr('href')
    const lang = $('span.l', el).text().replace(/\t|\n|\r/g, '')
    const title = $('span:not(.l)', el).text().replace(/\t|\n|\r/g, '')
    let rating
    switch ($('span.l', el).attr('class').split(' ').pop()) {
      case 'bad-icon':
        rating = '💢'
        break
      case 'neutral-icon':
        rating = '➖'
        break
      case 'positive-icon':
        rating = '✅'
    }
    if (!Object.keys(subtitles).includes(lang)) subtitles[lang] = []
    subtitles[lang].push({ lang, path, title, rating })
  }
  console.log(subtitles)
  return subtitles
}

export async function subsceneDownload (path) {
  const res = await ky.get('https://subscene.com' + path, {
    retry: retryOptions
  })
  const html = $(await res.text())
  const downloadPath = $('#downloadButton', html).attr('href')
  const subtitlesArchive = await ky.get('https://subscene.com' + downloadPath).arrayBuffer()
  const zipContents = await zip.loadAsync(subtitlesArchive)
  const subtitleFiles = []
  for (const subtitleName of Object.keys(zipContents.files)) {
    subtitleFiles.push({
      name: subtitleName,
      data: await zipContents.file(subtitleName).async('arraybuffer')
    })
  }
  console.log(subtitleFiles)
  return subtitleFiles
}
