import { persisted } from 'svelte-persisted-store'
import { defaults } from '.'

export const settings = persisted('settings', defaults, { beforeRead: value => ({ ...defaults, ...value }) })
