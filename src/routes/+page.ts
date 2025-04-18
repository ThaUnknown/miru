import { redirect } from '@sveltejs/kit'

import { outdatedComponent } from '$lib/modules/update'
import { SETUP_VERSION } from '$lib'

export async function load () {
  if (await outdatedComponent) return redirect(307, '/update/')
  redirect(307, Number(localStorage.getItem('setup-finished')) >= SETUP_VERSION ? '/app/home/' : '/setup')
}
