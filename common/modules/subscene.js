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
  const subElems = $('table tbody tr', html)
  for (let i = 1; i < subElems.length; i++) {
    const a1 = $('.a1 a', subElems[i])
    if (!a1.length) continue
    const path = a1.attr('href')
    const lang = $('span.l', a1).text().replace(/\t|\n|\r/g, '')
    const title = $('span:not(.l)', a1).text().replace(/\t|\n|\r/g, '')
    let rating
    switch ($('span.l', a1).attr('class').split(' ').pop()) {
      case 'bad-icon':
        rating = '💢'
        break
      case 'neutral-icon':
        rating = '➖'
        break
      case 'positive-icon':
        rating = '✅'
    }
    const comment = $('.a6', subElems[i]).text().replace(/\t|\n|\r/g, '')
    if (!Object.keys(subtitles).includes(lang)) subtitles[lang] = []
    subtitles[lang].push({ lang, path, title, rating, comment })
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
