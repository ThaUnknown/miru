import type { LayoutLoad } from './$types'

import { asyncStore } from '$lib/modules/anilist/client'
import { IDMedia } from '$lib/modules/anilist/queries'
import { episodes } from '$lib/modules/anizip'

export const load: LayoutLoad = async ({ params, fetch }) => {
  const store = asyncStore(IDMedia, { id: Number(params.id) }, { requestPolicy: 'cache-first' })

  const eps = await episodes(Number(params.id), fetch)

  return {
    eps,
    // mappings: await mappings,
    anime: await store
  }
}
