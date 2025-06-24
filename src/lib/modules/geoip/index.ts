import params from 'doc999tor-fast-geoip/build/params.js'

import { binarySearch, firstArrayItem, getNextIp, identity, ipStr2Num, type Format, type indexFile, type ipBlockRecord, type locationRecord } from './utils.ts'

const MASK = ipStr2Num('255.255.255.255')

const viteFixedImportWeTrullyHateViteWithAPassionForNotSupportingBasicFeatures = async <T>(path: string) => {
  // previously: return import('doc999tor-fast-geoip/data/locations.json', { with: { type: 'json' } })
  const res = await fetch(`/geoip/${path}.json`)
  return await res.json() as T
}

const ipCache: Record<string, Format> = {}
const locationCache = viteFixedImportWeTrullyHateViteWithAPassionForNotSupportingBasicFeatures<locationRecord[]>('locations')

async function readFile<T extends Format> (filename: string): Promise<T> {
  if (ipCache[filename] !== undefined) {
    return await Promise.resolve(ipCache[filename] as T)
  }
  const content = await viteFixedImportWeTrullyHateViteWithAPassionForNotSupportingBasicFeatures<T>(filename)
  ipCache[filename] = content
  return content
}

interface IpInfo {
  range: [number, number]
  country: string
  region: string
  eu: '0'|'1'
  timezone: string
  city: string
  ll: [number, number]
  metro: number
  area: number
}

export async function lookup (stringifiedIp: string): Promise<IpInfo> {
  const ip = ipStr2Num(stringifiedIp)
  const data = await readFile<indexFile>('index')

  // IP cannot be NaN
  if (Number.isNaN(ip)) throw new Error('IP cannot be NaN')
  const rootIndex = binarySearch(data, ip, identity)
  // Ip is not in the database, return empty object
  if (rootIndex === -1) throw new Error('IP not found in the database')

  let nextIp = getNextIp(data, rootIndex, MASK, identity)
  const data2 = await readFile<indexFile>('i' + rootIndex)
  const index = binarySearch(data2, ip, identity) + rootIndex * params.NUMBER_NODES_PER_MIDINDEX
  nextIp = getNextIp(data2, index, nextIp, identity)
  const data3 = await readFile<ipBlockRecord[]>('' + index)
  const index1 = binarySearch(data3, ip, firstArrayItem)
  const ipData = data3[index1]!

  if (!ipData[1]) throw new Error("IP doesn't any region nor country associated")

  nextIp = getNextIp<ipBlockRecord>(data3, index1, nextIp, firstArrayItem)
  const location = (await locationCache)[ipData[1]]!

  return {
    range: [ipData[0], nextIp] as [number, number],
    country: location[0],
    region: location[1],
    eu: location[5],
    timezone: location[4],
    city: location[2],
    ll: [ipData[2], ipData[3]] as [number, number],
    metro: location[3],
    area: ipData[4]
  }
}
