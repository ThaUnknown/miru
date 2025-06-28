import { redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'

import { server } from '$lib/modules/torrent'
import { generateRandomHexCode, W2GClient } from '$lib/modules/w2g'
import { w2globby } from '$lib/modules/w2g/lobby'

export function load () {
  const lastVal = get(server.last)
  w2globby.value ??= new W2GClient(generateRandomHexCode(8), true, lastVal?.media.id ? { mediaId: lastVal.media.id, episode: lastVal.episode, torrent: lastVal.id } : undefined)

  redirect(302, '/app/w2g/' + w2globby.value.code)
}
