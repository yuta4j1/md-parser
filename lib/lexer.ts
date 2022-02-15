import type { MdType, MdToken, HtmlElementToken, HtmlTagType } from './token'
import { matchRegexp, listMatchRegexp } from './util/matcher'
import type { Match } from './types/match'

const typeToHtmlTag = (mdtype: MdType): HtmlTagType => {
  switch (mdtype) {
    case 'h1':
      return 'h1'
    case 'h2':
      return 'h2'
    case 'h3':
      return 'h3'
    case 'h4':
      return 'h4'
    case 'h5':
      return 'h5'
    case 'h6':
      return 'h6'
    case 'emphasis':
      return 'em'
    case 'cancel':
      return 's'
    case 'code':
      return 'code'
    case 'text':
      return 'none'
    default:
      return 'none'
  }
}

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

// 先読みが必要になるリスト
// list text table

const requireNextRead = (type: MdType): boolean => {
  return type === 'text' || type === 'list'
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
  tokens: MdToken[]
): { token: HtmlElementToken; cursorIdx: number } => {
  let spanTokens: HtmlElementToken[] = []
  let textTokens: HtmlElementToken[] = []
  let idx = currIdx
  while (idx < tokens.length) {
    const t = tokens[idx]
    if (isInlineElment(t.type)) {
      const textStr = t.content

      if (textStr === '') {
        spanTokens.push({
          type: 'span',
          content: '',
          innerTokens: textTokens,
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
              innerTokens: textTokens,
            })
            textTokens = []
            idx++
            continue
          }
        }
        textTokens.push({
          type: typeToHtmlTag(tokens[idx].type),
          content: tokens[idx].content,
        })
        idx = idx + 1
      }
    } else {
      spanTokens.push({
        type: 'span',
        content: '',
        innerTokens: textTokens,
      })
      break
    }
  }
  // console.log('spanTokens', spanTokens)
  return {
    token: {
      type: 'p',
      content: '',
      innerTokens: spanTokens,
    },
    cursorIdx: idx,
  }
}

const listTokenizer = (
  currIdx: number,
  tokens: MdToken[],
  currIndent: number = 0
): { token: HtmlElementToken; cursorIdx: number } => {
  let liTokens: HtmlElementToken[] = []
  let idx = currIdx
  let thisIndent = currIndent

  while (idx < tokens.length) {
    const token = tokens[idx]
    if (token.type === 'list') {
      const tokenIndent = token.indent
      if (thisIndent === tokenIndent) {
        liTokens.push({
          type: 'li',
          content: token.content,
        })
        idx++
      } else {
        const indentDiff = tokenIndent - thisIndent
        console.log('indentDiff', indentDiff)
        if (indentDiff >= 2) {
          const retTokens = listTokenizer(idx, tokens, thisIndent + 2)
          idx = retTokens.cursorIdx
          liTokens.push({
            type: 'li',
            content: '',
            innerTokens: [retTokens.token],
          })
        } else if (indentDiff < 0) {
          idx += 1
          return {
            token: {
              type: 'ul',
              content: '',
              innerTokens: liTokens,
            },
            cursorIdx: idx,
          }
        }
      }
    } else {
      break
    }
  }

  return {
    token: {
      type: 'ul',
      content: '',
      innerTokens: liTokens,
    },
    cursorIdx: idx,
  }
}

// ブロック要素毎にトークンをまとめる
const mergeTokensByBlock = (tokens: MdToken[]): HtmlElementToken[] => {
  let retTokens: HtmlElementToken[] = []
  console.log('mergeTokensByBlock: ', tokens)
  let idx = 0
  while (idx < tokens.length) {
    const token = tokens[idx]
    if (requireNextRead(token.type)) {
      if (token.type === 'text') {
        const t = textTokenizer(idx, tokens)
        console.log('t', t.token.innerTokens)
        retTokens.push(t.token)
        idx = t.cursorIdx
      }
      if (token.type === 'list') {
        const t = listTokenizer(idx, tokens)
        console.log('t', t.token.innerTokens)
        retTokens.push(t.token)
        idx = t.cursorIdx
      }
    } else {
      retTokens.push({
        type: typeToHtmlTag(token.type),
        content: token.content,
      })
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

export const tokenizer = (srcText: string) => {
  let tokens: MdToken[] = []
  const processingLines = srcText.split('\n')
  for (const l of processingLines) {
    const t = rowTokenizer(l)
    tokens = [...tokens].concat(t)
  }
  // console.log('tokenizer call', processingLines)
  // 行ごとのtokenizeが完了したら、ブロックごとにトークンをまとめあげるtokenizeを行う。
  return mergeTokensByBlock(tokens)
}
