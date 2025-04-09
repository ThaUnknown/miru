import { redirect } from '@sveltejs/kit'

import { outdatedComponent } from '$lib/modules/update'

export function load () {
  if (outdatedComponent) return redirect(307, '/update/')
  redirect(307, localStorage.getItem('setup-finished') ? '/app/home/' : '/setup')
}
