import { app } from 'electron'
import { join } from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'

class Store {
  constructor (configName, defaults) {
    this.path = join(app.getPath('userData'), configName + '.json')

    this.data = parseDataFile(this.path, defaults)
  }

  get (key) {
    return this.data[key]
  }

  set (key, val) {
    this.data[key] = val
    writeFileSync(this.path, JSON.stringify(this.data))
  }
}

function parseDataFile (filePath, defaults) {
  try {
    return { ...defaults, ...JSON.parse(readFileSync(filePath).toString()) }
  } catch (error) {
    return defaults
  }
}

export default new Store('settings', { angle: 'default' })
