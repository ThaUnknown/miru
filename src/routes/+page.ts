import { redirect } from '@sveltejs/kit'

export function load () {
  redirect(307, localStorage.getItem('setup-finished') ? '/app/home/' : '/setup')
}
