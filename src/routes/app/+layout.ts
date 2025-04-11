import { error, redirect } from '@sveltejs/kit'

import { dev } from '$app/environment'
import native from '$lib/modules/native'
import { outdatedComponent } from '$lib/modules/update'
import { SETUP_VERSION } from '$lib'

export function load () {
  if (!dev && !native.isApp) return error(401, 'How did you get here?')
  if (Number(localStorage.getItem('setup-finished')) < SETUP_VERSION) redirect(307, '/setup')

  if (outdatedComponent) redirect(307, '/update/')
}
