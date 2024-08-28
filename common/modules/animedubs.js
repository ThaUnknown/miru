import { toast } from 'svelte-sonner'
import { writable } from 'simple-store-svelte'
import { codes } from '@/modules/anilist.js'
import Debug from 'debug'

const debug = Debug('ui:animedubs')

/*
 * MAL (MyAnimeList) Dubs (Mal-Dubs)
 * Dub information is returned as MyAnimeList ids.
 */
class MALDubs {
    /** @type {import('simple-store-svelte').Writable<ReturnType<MALDubs['getDubs']>>} */
     dubLists = writable()

    constructor() {
        this.getMALDubs()
        //  update dubLists every 60 mins
        setInterval(() => {
            this.getMALDubs()
        }, 1000 * 60 * 60)
    }

    async getMALDubs() {
        debug('Getting MyAnimeList Dubs IDs')
        let res = {}
        try {
            res = await fetch('https://raw.githubusercontent.com/MAL-Dubs/MAL-Dubs/main/data/dubInfo.json')
        } catch (e) {
            if (!res || res.status !== 404) throw e
        }
        if (!res.ok && (res.status === 429 || res.status === 500)) {
            throw res
        }
        let json = null
        try {
            json = await res.json()
        } catch (error) {
            if (res.ok) this.printError(error)
        }
        if (!res.ok) {
            if (json) {
                for (const error of json?.errors || []) {
                    this.printError(error)
                }
            } else {
                this.printError(res)
            }
        }
        this.dubLists.value = await json
        return json
    }

    printError(error) {
        debug(`Error: ${error.status || 429} - ${error.message || codes[error.status || 429]}`)
        toast.error('Dub Caching Failed', {
            description: `Failed to load dub information!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
            duration: 3000
        })
    }
}

export const malDubs = new MALDubs()