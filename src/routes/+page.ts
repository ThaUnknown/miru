import { redirect, error } from '@sveltejs/kit'

import { outdatedComponent } from '$lib/modules/update'
import { SETUP_VERSION } from '$lib'
import { dev } from '$app/environment'
import native from '$lib/modules/native'

export async function load () {
  if (!dev && !native.isApp) return error(401, 'How did you get here?')
  if (await outdatedComponent) return redirect(307, '/update/')
  redirect(307, Number(localStorage.getItem('setup-finished')) >= SETUP_VERSION ? '/app/home/' : '/setup')
}
