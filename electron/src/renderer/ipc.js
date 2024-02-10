import { wrap } from 'comlink'

export default wrap(globalThis.Native)

export const TorrentClient = wrap(globalThis.Torrent)
