import { writable } from 'simple-store-svelte'

import type { W2GClient } from '.'

export const w2globby = writable<W2GClient | undefined>()
