import { redirect } from '@sveltejs/kit'

import { outdatedComponent } from '$lib/modules/update'

export async function load () {
  if (!await outdatedComponent) redirect(307, '/')
}
