import { toast } from 'svelte-sonner'
import { writable } from 'simple-store-svelte'
import { codes } from '@/modules/anilist.js'

export const dubInfo = writable()

const initialized = writable(false)


export async function cacheDubs() {
    await initialized.subscribe(async value => {
        if (!value) {
            dubInfo.value = await getDubInfo()
            initialized.set(true)
            // update dubInfo every hour
            setInterval(async () => dubInfo.value = await getDubInfo(), 1000 * 60 * 60)
        }
    })
}

async function getDubInfo() {
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
        if (res.ok) printError(error)
    }
    if (!res.ok) {
        if (json) {
            for (const error of json?.errors || []) {
                printError(error)
            }
        } else {
            printError(res)
        }
    }
    return json
}

function printError(error) {
    console.warn(error)
    toast.error('Dub Caching Failed', {
        description: `Failed to load dub information!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
        duration: 3000
    })
}
