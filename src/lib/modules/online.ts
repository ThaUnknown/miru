import { readable } from 'simple-store-svelte'

export default readable(navigator.onLine, set => {
  addEventListener('online', () => set(true))
  addEventListener('offline', () => set(false))
})
