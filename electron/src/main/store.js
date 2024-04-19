import { app } from 'electron'
import { join } from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'

class Store {
  /**
   * @param {string} configName
   * @param {{ angle: string; player: string; torrentPath: string; }} defaults
   */
  constructor (configName, defaults) {
    this.path = join(app.getPath('userData'), configName + '.json')

    this.data = parseDataFile(this.path, defaults)
  }

  /**
   * @param {string} key
   */
  get (key) {
    return this.data[key]
  }

  /**
   * @param {string} key
   * @param {string} val
   */
  set (key, val) {
    this.data[key] = val
    writeFileSync(this.path, JSON.stringify(this.data))
  }
}

/**
 * @param {import("fs").PathOrFileDescriptor} filePath
 * @param {any} defaults
 */
function parseDataFile (filePath, defaults) {
  try {
    return { ...defaults, ...JSON.parse(readFileSync(filePath).toString()) }
  } catch (error) {
    return defaults
  }
}

export default new Store('settings', { angle: 'default', player: '', torrentPath: '' })
