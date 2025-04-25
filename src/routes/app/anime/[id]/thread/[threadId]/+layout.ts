import type { LayoutLoad } from './$types'

import { asyncStore } from '$lib/modules/anilist/client'
import { Comments, Thread } from '$lib/modules/anilist/queries'

export const load: LayoutLoad = async ({ params }) => {
  const commentsStore = asyncStore(Comments, { threadId: Number(params.threadId) })
  return {
    comments: await commentsStore,
    thread: await asyncStore(Thread, { threadId: Number(params.threadId) }, { requestPolicy: 'cache-first' })
  }
}
