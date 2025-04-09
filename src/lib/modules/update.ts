import { compare, diff } from 'semver'

import native from './native'

import { version } from '$app/environment'

function compareVersions (): 'ui' | 'client' | undefined {
  const releaseType = diff(version, native.version())
  if (!releaseType) return
  if (releaseType === 'patch') return

  return compare(version, native.version()) === -1 ? 'ui' : 'client'
}

export const outdatedComponent = compareVersions()
