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
        const json = await res.json()
        return json.map(({ body, tag_name: version, published_at: date, assets }) => ({ body, version, date, assets }))
      } catch (e) {
        return []
      }
    })()
  }
}
