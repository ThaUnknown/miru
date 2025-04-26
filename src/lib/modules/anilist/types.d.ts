import type { FullMedia, MediaEdgeFrag } from './queries'
import type { ResultOf } from 'gql.tada'

export type Media = ResultOf<typeof FullMedia>

export type MediaEdge = ResultOf<typeof MediaEdgeFrag>
