import type { PageLoad } from './$types'

import { w2globby } from '$lib/modules/w2g/lobby'

export const load: PageLoad = ({ params }) => {
  if (w2globby.value && w2globby.value.code !== params.id) {
    w2globby.value.destroy()
    w2globby.value = undefined
  }
  return params
}
