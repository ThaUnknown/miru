import { redirect } from '@sveltejs/kit'

import { generateRandomHexCode, W2GClient } from '$lib/modules/w2g'
import { w2globby } from '$lib/modules/w2g/lobby'

export function load () {
  w2globby.value ??= new W2GClient(generateRandomHexCode(16), true)

  redirect(302, '/app/w2g/' + w2globby.value.code)
}
