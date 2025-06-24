type extractKeyFunction<recordType> = (record: recordType) => number
export type indexFile = number[]
export type ipBlockRecord = [number, number|null, number, number, number]

export type Format = indexFile | ipBlockRecord[] | locationRecord[]

export type locationRecord = [string, string, string, number, string, '0' | '1']

export function identity (item: number): number {
  return item
}

export function binarySearch<recordType> (list: recordType[], item: number, extractKey: extractKeyFunction<recordType>): number {
  let low = 0
  let high = list.length - 1
  while (true) {
    const i = Math.round((high - low) / 2) + low
    if (item < extractKey(list[i]!)) {
      if (i === high && i === low) {
        return -1 // Item is lower than the first item
      } else if (i === high) {
        high = low
      } else {
        high = i
      }
    } else if (item >= extractKey(list[i]!) && (i === (list.length - 1) || item < extractKey(list[i + 1]!))) {
      return i
    } else {
      low = i
    }
  }
}

export function ipStr2Num (stringifiedIp: string): number {
  return stringifiedIp.split('.')
    .map(e => parseInt(e)).reduce((acc, val, index) => acc + val * Math.pow(256, 3 - index), 0)
}

export function firstArrayItem (item: ipBlockRecord): number {
  return item[0]
}

export function getNextIp<recordType = number> (data: recordType[], index: number, currentNextIp: number, extractKey: extractKeyFunction<recordType>): number {
  if (index < (data.length - 1)) {
    return extractKey(data[index + 1]!)
  } else {
    return currentNextIp
  }
}
