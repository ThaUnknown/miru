/**
 * @template {object} InEvent
 * @template {object} OutEvent
 */
export class BidirectionalFilteredEventBus {
  /**
   * @type {string}
   */
  #lastInEvent
  /**
   * @type {string}
   */
  #lastOutEvent

  get isFirstInFired () {
    return this.#lastInEvent !== '{}'
  }

  get isFirstOutFired () {
    return this.#lastOutEvent !== '{}'
  }

  #inFilter
  #outFilter

  #inSink
  #outSink

  /**
   * @template T
   * @typedef {(event: T, lastEvent: T) => boolean} Filter
   */

  /**
   * @typedef {(InEvent) => any} InSink
   * @typedef {(OutEvent) => any} OutSink
   */

  /**
   * @param {InSink} inSink
   * @param {OutSink} outSink
   * @param {Filter<InEvent>} inFilter
   * @param {Filter<OutEvent>} outFilter
   */
  constructor (inSink, outSink, inFilter, outFilter) {
    this.#inSink = inSink
    this.#outSink = outSink
    this.#inFilter = inFilter
    this.#outFilter = outFilter
    this.reinit()
  }

  /**
   * @param {InEvent | OutEvent} event
   * @param {string} hash
   * @param {string} lastEvent
   * @param {Filter<InEvent | OutEvent>} filter
   * @returns
   */
  #drop (event, hash, lastEvent, filter) {
    return filter?.(event, JSON.parse(lastEvent)) || hash === this.#lastOutEvent || hash === this.#lastInEvent
  }

  #filter (event, lastEvent, sink, filter) {
    const hash = JSON.stringify(event)

    if (this.#drop(event, hash, lastEvent, filter)) {
      console.log('Dropped', event)
      return hash
    }

    console.log('Passed', event)
    sink?.(event)

    return hash
  }

  /**
   * @param {InEvent} event
   */
  in (event) {
    console.log('IN', event)
    this.#lastInEvent = this.#filter(event, this.#lastInEvent, this.#inSink, this.#inFilter)
  }

  /**
   * @param {OutEvent} event
   */
  out (event) {
    console.log('OUT', event)
    this.#lastOutEvent = this.#filter(event, this.#lastOutEvent, this.#outSink, this.#outFilter)
  }

  reinit () {
    this.#lastInEvent = '{}'
    this.#lastOutEvent = '{}'
  }
}
