import type { MdType } from '../token'

export type Match = {
  matchedText: string
  contentText: string
  idx: number
  lastIdx: number
  mdType: MdType
  indent?: number
}
