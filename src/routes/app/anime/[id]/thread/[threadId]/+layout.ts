import type { LayoutLoad } from './$types'

import { asyncStore } from '$lib/modules/anilist/client'
import { Thread } from '$lib/modules/anilist/queries'

export const load: LayoutLoad = async ({ params }) => {
  return {
    thread: await asyncStore(Thread, { threadId: Number(params.threadId) }, { requestPolicy: 'cache-first' })
  }
}
