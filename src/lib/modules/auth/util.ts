import { episodes, type Media } from '../anilist'

// TODO: these should probably be in auth aggregator

import local from './local'

export function progress ({ mediaListEntry, id }: Pick<Media, 'mediaListEntry' | 'id'>): number | undefined {
  if (!mediaListEntry?.progress) return local.get(id)?.mediaListEntry?.progress ?? undefined
  return mediaListEntry.progress
}

export function fav (media: Pick<Media, 'isFavourite' | 'id'>): boolean {
  return media.isFavourite || (local.get(media.id)?.isFavourite ?? false)
}

export function list (media: Pick<Media, 'mediaListEntry' | 'id'>): 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING' | null | undefined {
  return media.mediaListEntry?.status ?? local.get(media.id)?.mediaListEntry?.status
}

export function lists (media: Pick<Media, 'mediaListEntry' | 'id'>): Array<{ enabled: boolean, name: string }> | undefined {
  return media.mediaListEntry?.customLists as Array<{ enabled: boolean, name: string }> | undefined
}

export function repeat (media: Pick<Media, 'mediaListEntry' | 'id'>): number | null | undefined {
  return media.mediaListEntry?.repeat ?? local.get(media.id)?.mediaListEntry?.repeat
}

export function score (media: Pick<Media, 'mediaListEntry' | 'id'>): number | null | undefined {
  return media.mediaListEntry?.score ?? local.get(media.id)?.mediaListEntry?.score
}

export function of (media: Pick<Media, 'aired' | 'notaired' | 'episodes' | 'mediaListEntry' | 'id'>): string | undefined {
  const count = episodes(media)
  if (count === 1 || !count) return

  const prog = progress(media)
  if (!prog || prog === count) return `${count} Episodes`

  return `${prog} / ${count} Episodes`
}
