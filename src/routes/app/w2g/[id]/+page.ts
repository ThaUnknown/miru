import type { PageLoad } from './$types'

import { W2GClient } from '$lib/modules/w2g'
import { w2globby } from '$lib/modules/w2g/lobby'

export const load: PageLoad = ({ params }) => {
  if (w2globby.value && w2globby.value.code !== params.id) {
    w2globby.value.destroy()
    w2globby.value = undefined
  }
  w2globby.value ??= new W2GClient(params.id, false)
  return params
}
