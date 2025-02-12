import type { ResultOf } from 'gql.tada'
import type { FullMedia, MediaEdgeFrag } from './queries'

export type Media = ResultOf<typeof FullMedia>

export type MediaEdge = ResultOf<typeof MediaEdgeFrag>
