import { episodes, type Media } from '../anilist'

export function progress ({ mediaListEntry }: Media): number | undefined {
  if (!mediaListEntry?.progress) return
  return mediaListEntry.progress
}

export function fav (media: Media): boolean {
  return media.isFavourite
}

export function list (media: Media): 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING' | null | undefined {
  return media.mediaListEntry?.status
}

export function lists (media: Media): Array<{ enabled: boolean, name: string }> | undefined {
  return media.mediaListEntry?.customLists as Array<{ enabled: boolean, name: string }> | undefined
}

export function repeat (media: Media): number | null | undefined {
  return media.mediaListEntry?.repeat
}

export function score (media: Media): number | null | undefined {
  return media.mediaListEntry?.score
}

export function of (media: Media): string | undefined {
  const count = episodes(media)
  if (count === 1 || !count) return

  const prog = progress(media)
  if (!prog || prog === count) return `${count} Episodes`

  return `${prog} / ${count} Episodes`
}
