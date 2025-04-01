import { error } from '@sveltejs/kit'

import native from '$lib/modules/native'

export function load () {
  if (!import.meta.env.DEV && !native.isApp) error(401, 'How did you get here?')
}
