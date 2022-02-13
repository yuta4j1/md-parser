import type { MdType, Token } from './token'
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

// 先読みが必要になるリスト
// list text table

const requireNextRead = (type: MdType): boolean => {
  return type === 'text'
}

const isInlineElment = (type: MdType): boolean => {
  return (
    type === 'text' ||
    type === 'emphasis' ||
    type === 'cancel' ||
    type === 'code'
  )
}

const textTokenizer = (
  currIdx: number,
  tokens: Token[]
): { token: Token; cursorIdx: number } => {
  let spanTokens: Token[] = []
  let textTokens: Token[] = []
  let idx = currIdx
  while (idx < tokens.length) {
    const t = tokens[idx]
    if (isInlineElment(t.type)) {
      const textStr = t.content

      if (textStr === '') {
        spanTokens.push({
          type: 'span',
          content: '',
          childToken: textTokens,
        })
        idx++
        break
      } else {
        if (textStr.length >= 2) {
          const lastTwoChars = textStr.slice(-2)

          if (lastTwoChars === '  ') {
            spanTokens.push({
              type: 'span',
              content: '',
              childToken: textTokens,
            })
            textTokens = []
            idx++
            continue
          }
        }
        textTokens.push(tokens[idx])
        idx = idx + 1
      }
    } else {
      spanTokens.push({
        type: 'span',
        content: '',
        childToken: textTokens,
      })
      break
    }
  }
  console.log('spanTokens', spanTokens)
  return {
    token: {
      type: 'p',
      content: '',
      childToken: spanTokens,
    },
    cursorIdx: idx,
  }
}

// ブロック要素毎にトークンをまとめる
const mergeTokensByBlock = (tokens: Token[]): Token[] => {
  let retTokens: Token[] = []
  console.log('mergeTokensByBlock: ', tokens)
  let idx = 0
  while (idx < tokens.length) {
    if (requireNextRead(tokens[idx].type)) {
      if (tokens[idx].type === 'text') {
        const t = textTokenizer(idx, tokens)
        console.log('t', t.token.childToken)
        retTokens.push(t.token)
        idx = t.cursorIdx
      }
    } else {
      retTokens.push(tokens[idx])
      idx++
    }
  }
  return retTokens
}

const H1_REGEXP = /^# (.+)$/g
const H2_REGEXP = /^## (.+)$/g
const H3_REGEXP = /^### (.+)$/g
const H4_REGEXP = /^#### (.+)$/g
const H5_REGEXP = /^##### (.+)$/g
const H6_REGEXP = /^###### (.+)$/g

const EMPHASIS_REGEXP = /\*\*(.+?)\*\*/g
const CANCEL_REGEXP = /~~(.+?)~~/g
const CODE_REGEXP = /`(.+?)`/g

const rowTokenizer = (rowText: string): Token[] => {
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

export const tokenizer = (srcText: string) => {
  let tokens: Token[] = []
  const processingLines = srcText.split('\n')
  for (const l of processingLines) {
    const t = rowTokenizer(l)
    tokens = [...tokens].concat(t)
  }
  console.log('tokenizer call', processingLines)
  // 行ごとのtokenizeが完了したら、ブロックごとにトークンをまとめあげるtokenizeを行う。
  return mergeTokensByBlock(tokens)
}
