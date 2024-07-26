export default class AbstractSource {
  name = 'Missing name'
  description = 'No description provided'
  /** @type {import('./type-definitions').Accuracy} */
  accuracy = 'Low'
  /** @type {import('./type-definitions').Config} */
  config = {}

  /**
   * Gets results for single episode
   * @type {import('./type-definitions').SearchFunction}
   */
  single (options) {
    throw new Error('Source doesn\'t implement single')
  }

  /**
   * Gets results for batch of episodes
   * @type {import('./type-definitions').SearchFunction}
   */
  batch (options) {
    throw new Error('Source doesn\'t implement batch')
  }

  /**
   * Gets results for a movie
   * @type {import('./type-definitions').SearchFunction}
   */
  movie (options) {
    throw new Error('Source doesn\'t implement movie')
  }
}
