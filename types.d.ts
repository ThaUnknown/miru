export {}

declare global {
  interface Window {
    IPC: any;
    port: MessagePort
  }
  interface EventTarget {
    on: (type: string, callback: (any) => void, options?: boolean | {}) => void
    once: (type: string, callback: (any) => void, options?: boolean | {}) => void
    emit: (type: string, data?: any) => void
    dispatch: (type: string, data?: any) => void
    removeListener: (type: string, callback: (any) => void) => void
    off: (type: string, callback: (any) => void) => void
  }
}
