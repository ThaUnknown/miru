import { error, redirect } from '@sveltejs/kit'

import { dev } from '$app/environment'
import native from '$lib/modules/native'
import { outdatedComponent } from '$lib/modules/update'

export async function load () {
  if (!dev && !native.isApp) return error(401, 'How did you get here?')

  if (await outdatedComponent) redirect(307, '/update/')
}
