import { alRequest } from '@/modules/anilist.js'

export default class Sections {
  constructor (data = []) {
    this.sections = []
    this.add(data)
  }

  add (data) {
    for (const { title, variables = {}, type, load = Sections.createFallbackLoad(variables, type), preview } of data) {
      this.sections.push({ load, title, preview, variables })
    }
  }

  static createFallbackLoad (variables, type) {
    return (page = 1, perPage = 50, search = variables) => {
      const options = { method: 'Search', page, perPage, ...Sections.sanitiseObject(search) }
      const res = alRequest(options)
      return Sections.wrapResponse(res, perPage, type)
    }
  }

  static wrapResponse (res, length, type) {
    res.then(res => {
      this.hasNext = res?.data?.Page.pageInfo.hasNextPage
    })
    return Array.from({ length }, (_, i) => ({ type, data: Sections.fromPending(res, i) }))
  }

  static async fromPending (arr, i) {
    const { data } = await arr
    return data.Page.media[i]
  }

  static sanitiseObject (object = {}) {
    const safe = {}
    for (const [key, value] of Object.entries(object)) {
      if (value) safe[key] = value
    }
    return safe
  }
}
