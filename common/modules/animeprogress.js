import Dexie, { liveQuery } from 'dexie';

export const db = new Dexie('miru');

db.version(1).stores({
    animeEpisodeProgress: '[mediaId+episode], currentTime, safeduration, createdAt, updatedAt', // mediaId and episode is the composite key
});

// Return an object with the progress of each episode in percent (0-100), keyed by episode number
export function liveAnimeProgress (mediaId){
  return liveQuery(async () => {
      if (!mediaId) return {}
      const results = await db.animeEpisodeProgress.where({ mediaId }).toArray();
      if (!results) return {}
      // Return an object with the episode as the key and the progress as the value
      return Object.fromEntries(results.map(result => [
          result.episode,
          Math.ceil(result.currentTime / result.safeduration * 100)
      ]))
  });
}

// Return an individual episode's progress in percent (0-100)
export function liveAnimeEpisodeProgress (mediaId, episode) {
  return liveQuery(async () => {
    if (!mediaId || !episode) return 0
    const result = await getAnimeProgress(mediaId, episode)
    if (!result) return 0
    return Math.ceil(result.currentTime / result.safeduration * 100)
  });
}

// Return an individual episode's record { mediaId, episode, currentTime, safeduration, createdAt, updatedAt }
export function getAnimeProgress (mediaId, episode) {
  return db.animeEpisodeProgress.where({ mediaId, episode }).first();
}

// Set an individual episode's progress
export async function setAnimeProgress ({mediaId, episode, currentTime, safeduration}) {
  // If you want to update the record if it already exists:
  const existing = await getAnimeProgress(mediaId, episode);
  if (existing) {
    return await db.animeEpisodeProgress.update([ mediaId, episode ], {
      currentTime,
      safeduration,
      updatedAt: Date.now(),
    });
  }

  // If you want to insert a new record if it does not exist:
  return await db.animeEpisodeProgress.put({
    mediaId,
    episode,
    currentTime,
    safeduration,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
