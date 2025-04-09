import { redirect } from '@sveltejs/kit'

import { outdatedComponent } from '$lib/modules/update'

export function load () {
  if (!outdatedComponent) redirect(307, '/')
}
