import { compare, diff } from 'semver'

import native from './native'

import { version } from '$app/environment'

async function compareVersions (): Promise<'ui' | 'client' | undefined> {
  const nativeVersion = await native.version()
  const releaseType = diff(version, nativeVersion)
  if (!releaseType) return
  if (releaseType === 'patch') return

  return compare(version, nativeVersion) === -1 ? 'ui' : 'client'
}

export const outdatedComponent = compareVersions()

export const uiUpdate = new Promise(resolve => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
})
