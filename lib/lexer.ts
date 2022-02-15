import type { MdType, MdToken, HtmlElementToken, HtmlTagType } from './token'
import { matchRegexp, listMatchRegexp } from './util/matcher'
import type { Match } from './types/match'

const tokenize = (text: string, matches: Match[]): MdToken[] => {
  let tokens: MdToken[] = []
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
        if (match.mdType === 'list') {
          tokens.push({
            type: match.mdType,
            content: match.contentText,
            indent: match.indent,
          })
        } else {
          tokens.push({
            type: match.mdType,
            content: match.contentText,
          })
        }
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

const H1_REGEXP = /^# (.+)$/g
const H2_REGEXP = /^## (.+)$/g
const H3_REGEXP = /^### (.+)$/g
const H4_REGEXP = /^#### (.+)$/g
const H5_REGEXP = /^##### (.+)$/g
const H6_REGEXP = /^###### (.+)$/g

const LIST_REGEXP = /^( *)([-|\*|\+] (.+))$/g

const EMPHASIS_REGEXP = /\*\*(.+?)\*\*/g
const CANCEL_REGEXP = /~~(.+?)~~/g
const CODE_REGEXP = /`(.+?)`/g

const rowTokenizer = (rowText: string): MdToken[] => {
  const h1Matches = matchRegexp(rowText, {
    mdType: 'h1',
    regexp: H1_REGEXP,
  })
  const h2Matches = matchRegexp(rowText, {
    mdType: 'h2',
    regexp: H2_REGEXP,
  })
  const h3Matches = matchRegexp(rowText, {
    mdType: 'h3',
    regexp: H3_REGEXP,
  })
  const h4Matches = matchRegexp(rowText, {
    mdType: 'h4',
    regexp: H4_REGEXP,
  })
  const h5Matches = matchRegexp(rowText, {
    mdType: 'h5',
    regexp: H5_REGEXP,
  })
  const h6Matches = matchRegexp(rowText, {
    mdType: 'h6',
    regexp: H6_REGEXP,
  })

  const listMatches = listMatchRegexp(rowText, {
    mdType: 'list',
    regexp: LIST_REGEXP,
  })

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
  const allMatches = [
    ...h1Matches,
    ...h2Matches,
    ...h3Matches,
    ...h4Matches,
    ...h5Matches,
    ...h6Matches,
    ...listMatches,
    ...emMatches,
    ...cancelMatches,
    ...codeMatches,
  ]
  // index順にソートする
  allMatches.sort((a, b) => {
    return a.idx - b.idx
  })
  console.log('allMatches', allMatches)
  const tokens = tokenize(rowText, allMatches)
  return tokens
}

// 字句解析
export const tokenizer = (srcText: string): MdToken[] => {
  let tokens: MdToken[] = []
  const processingLines = srcText.split('\n')
  for (const l of processingLines) {
    const t = rowTokenizer(l)
    tokens = [...tokens].concat(t)
  }
  // console.log('tokenizer call', processingLines)
  return tokens
}
