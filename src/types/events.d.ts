declare module 'events' {
  declare class EventEmitter<Events extends Record<string, unknown[]>> {
    addListener<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    emit: <Event extends keyof Events>(
      event: Event,
      ...args: Events[Event]
    ) => boolean

    emitted<Event extends keyof Events>(
      event: Event
    ): Promise<Events[Event]>

    eventNames(): Array<keyof Events>
    listeners<Event extends keyof Events>(
      event: Event
    ): Array<(...args: Events[Event]) => unknown>

    listenerCount(event: keyof Events): number
    on<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    once<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    prependListener<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    prependOnceListener<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    removeAllListeners(event?: keyof Events): this
    removeListener<Event extends keyof Events>(
      event: Event,
      listener: (...args: Events[Event]) => unknown
    ): this

    setMaxListeners(n: number): this
    getMaxListeners(): number
  }
  export { EventEmitter as default, EventEmitter }
}
