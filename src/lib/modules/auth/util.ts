import { episodes, type Media } from '../anilist'

export function progress ({ mediaListEntry }: Pick<Media, 'mediaListEntry'>): number | undefined {
  if (!mediaListEntry?.progress) return
  return mediaListEntry.progress
}

export function fav (media: Pick<Media, 'isFavourite'>): boolean {
  return media.isFavourite
}

export function list (media: Pick<Media, 'mediaListEntry'>): 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING' | null | undefined {
  return media.mediaListEntry?.status
}

export function lists (media: Pick<Media, 'mediaListEntry'>): Array<{ enabled: boolean, name: string }> | undefined {
  return media.mediaListEntry?.customLists as Array<{ enabled: boolean, name: string }> | undefined
}

export function repeat (media: Pick<Media, 'mediaListEntry'>): number | null | undefined {
  return media.mediaListEntry?.repeat
}

export function score (media: Pick<Media, 'mediaListEntry'>): number | null | undefined {
  return media.mediaListEntry?.score
}

export function of (media: Pick<Media, 'aired' | 'notaired' | 'episodes' | 'mediaListEntry'>): string | undefined {
  const count = episodes(media)
  if (count === 1 || !count) return

  const prog = progress(media)
  if (!prog || prog === count) return `${count} Episodes`

  return `${prog} / ${count} Episodes`
}
