import type { MdType, MdToken, HtmlTagType, HtmlElementToken } from './token'

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
          liTokens[liTokens.length - 1].innerTokens = [retTokens.token]
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

// トークンをHTML出力用のツリーデータに変換する
export const parse = (tokens: MdToken[]): HtmlElementToken[] => {
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
