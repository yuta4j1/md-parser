import type { Token, MdType } from './token'

const typeToHtmlTag = (mdtype: MdType): string => {
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
    case 'p':
      return 'p'
    case 'emphasis':
      return 'em'
    case 'cancel':
      return 's'
    case 'code':
      return 'code'
    case 'span':
      return 'span'
    default:
      return ''
  }
}

export const parse = (tokens: Token[]) => {
  let htmlText = ''
  for (const token of tokens) {
    const htmlTag = typeToHtmlTag(token.type)

    if (token.childToken && token.childToken.length > 0) {
      const innerHtmlText = parse(token.childToken)
      htmlText += `<${htmlTag}>${innerHtmlText}</${htmlTag}>\n`
    } else {
      if (token.type === 'text' && htmlTag === '') {
        htmlText += token.content
      } else {
        htmlText += `<${htmlTag}>${token.content}</${htmlTag}>\n`
      }
    }
  }
  return htmlText
}
