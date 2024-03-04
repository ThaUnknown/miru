import 'quartermoon/css/quartermoon-variables.css'
import '@fontsource-variable/material-symbols-outlined/full.css'
import '@fontsource-variable/nunito'
import '@fontsource/roboto'
import '@/css.css'
import '$lib/css.css'

export const prerender = false
export const csr = true
export const ssr = false
export const trailingSlash = 'always'

/** @type {import('./$types').LayoutLoad} */
export function load ({ fetch }) {
  return {
    releases: (async () => {
      try {
        const res = await fetch('https://api.github.com/repos/ThaUnknown/miru/releases')
        /** @type {any[]} */
        const json = await res.json()
        return json.map(({ body, tag_name: version, published_at: date, assets }) => /** @type {{ body: string, version: string, date: string, assets: {name: string, browser_download_url: string}[] }} */({ body, version, date, assets }))
      } catch (e) {
        return []
      }
    })(),
    stargazers: (async () => {
      try {
        const res = await fetch('https://api.github.com/repos/ThaUnknown/miru/stargazers?per_page=100&page=' + (Math.round(Math.random() * 10) + 1))
        /** @type {any[]} */
        const json = await res.json()
        return json.map(({ html_url: htmlUrl, avatar_url: avatarUrl, login }) => ({ htmlUrl, avatarUrl, login }))
      } catch (e) {
        return []
      }
    })()
  }
}
