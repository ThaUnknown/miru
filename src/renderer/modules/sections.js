import { alRequest } from '@/modules/anilist.js'

export default class Sections {
  constructor (data = []) {
    this.sections = []
    this.search = {}
    this.add(data)
  }

  add (data) {
    for (const { title, variables = {}, type, load = this.createFallbackLoad(variables, type), preview } of data) {
      this.sections.push({ load, title, preview })
    }
  }

  createFallbackLoad (variables, type) {
    return (page = 1, perPage = 50) => {
      const options = { method: 'Search', page, perPage, ...variables, ...this.sanitiseObject(this.search) }
      const res = alRequest(options)
      return this.wrapResponse(res, perPage, type)
    }
  }

  wrapResponse (res, length, type) {
    res.then(res => {
      this.hasNext = res?.data?.Page.pageInfo.hasNextPage
    })
    return Array.from({ length }, (_, i) => ({ type, data: this.fromPending(res, i) }))
  }

  async fromPending (arr, i) {
    const { data } = await arr
    return data.Page.media[i]
  }

  sanitiseObject (object) {
    const safe = {}
    for (const [key, value] of Object.entries(object)) {
      if (value) safe[key] = value
    }
    return safe
  }
}
