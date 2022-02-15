import type { Match } from '../types/match'
import type { MdType } from '../token'

export const matchRegexp = (
  src: string,
  matcher: { mdType: MdType; regexp: RegExp }
): Match[] => {
  let matches: Match[] = []
  const regexp = matcher.regexp
  let match
  while ((match = regexp.exec(src)) !== null) {
    matches.push({
      matchedText: match[0],
      contentText: match[1],
      idx: match.index,
      lastIdx: regexp.lastIndex,
      mdType: matcher.mdType,
    })
  }
  return matches
}

export const listMatchRegexp = (
  src: string,
  matcher: { mdType: MdType; regexp: RegExp }
): Match[] => {
  let matches: Match[] = []
  const regexp = matcher.regexp
  let match
  while ((match = regexp.exec(src)) !== null) {
    matches.push({
      matchedText: match[0],
      contentText: match[3],
      idx: match.index,
      lastIdx: regexp.lastIndex,
      mdType: matcher.mdType,
      indent: match[1].length,
    })
  }
  return matches
}
