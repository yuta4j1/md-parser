import type { Token } from './token'
import { matchRegexp } from './util/matcher'
import type { Match } from './types/match'

const tokenize = (text: string, matches: Match[]): Token[] => {
  let tokens: Token[] = []
  let matchDatas = [...matches]
  if (matches.length === 0) {
    tokens.push({
      type: 'text',
      content: text,
    })
    return tokens
  }

  let cursor = 0
  while (cursor < text.length) {
    if (matchDatas.length > 0) {
      const match = matchDatas.shift()
      if (cursor < match.idx) {
        const textTokenContent = text.slice(cursor, match.idx)
        tokens.push({
          type: 'text',
          content: textTokenContent,
        })
        tokens.push({
          type: match.mdType,
          content: match.contentText,
        })
        cursor = match.lastIdx
      } else if (cursor === match.idx) {
        tokens.push({
          type: match.mdType,
          content: match.contentText,
        })
        cursor = match.lastIdx
      }
    } else {
      const textTokenContent = text.slice(cursor, text.length)
      tokens.push({
        type: 'text',
        content: textTokenContent,
      })
      cursor = text.length
    }
  }

  return tokens
}

const EMPHASIS_REGEXP = /\*\*(.+?)\*\*/g
const CANCEL_REGEXP = /~~(.+?)~~/g
const CODE_REGEXP = /`(.+?)`/g

const rowTokenizer = (rowText: string) => {
  const emMatches = matchRegexp(rowText, {
    mdType: 'emphasis',
    regexp: EMPHASIS_REGEXP,
  })
  const cancelMatches = matchRegexp(rowText, {
    mdType: 'cancel',
    regexp: CANCEL_REGEXP,
  })
  const codeMatches = matchRegexp(rowText, {
    mdType: 'code',
    regexp: CODE_REGEXP,
  })
  const allMatches = [...emMatches, ...cancelMatches, ...codeMatches]
  // index順にソートする
  allMatches.sort((a, b) => {
    return a.idx - b.idx
  })
  console.log('allMatches', allMatches)
  const tokens = tokenize(rowText, allMatches)
  console.log('rowTokens!', tokens)
  return emMatches
}

export const tokenizer = (srcText: string) => {
  let tokens: Token[] = []
  const processingLines = srcText.split('\n')
  for (const l of processingLines) {
    const t = rowTokenizer(l)
    console.log('data', t)
    if (t.length === 0) {
      tokens.push({
        type: 'text',
        content: l,
      })
    } else {
      tokens.push({
        type: 'emphasis',
        content: '',
      })
    }
  }
  console.log('tokenizer call', processingLines)
}
