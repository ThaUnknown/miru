import { compare, diff } from 'semver'

import native from './native'

import { version } from '$app/environment'
import { highEntropyValues } from '$lib/utils'

export const isBrokenVeryBadly = native.version().then(async nativeVersion => {
  const entr = await highEntropyValues
  if (entr && entr.platform !== 'Windows') return false
  return compare(nativeVersion, '6.4.4') === -1 && compare(nativeVersion, '6.4.0') !== -1
})

async function compareVersions (): Promise<'ui' | 'client' | undefined> {
  const nativeVersion = await native.version()
  const releaseType = diff(version, nativeVersion)
  // TODO: REMOVE MEEE!!!
  if (await isBrokenVeryBadly) return 'client'
  if (!releaseType) return
  if (releaseType === 'patch') return

  return compare(version, nativeVersion) === -1 ? 'ui' : 'client'
}

export const outdatedComponent = compareVersions()

export const uiUpdate = new Promise(resolve => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
})
