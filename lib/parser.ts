import type { Token, MdType } from './token'

const typeToHtmlTag = (mdtype: MdType): string => {
  switch (mdtype) {
    case 'emphasis':
      return 'em'
    case 'cancel':
      return 's'
    case 'code':
      return 'code'
    case 'text':
      return 'span'
    default:
      return 'span'
  }
}

export const parse = (tokens: Token[]) => {
  let htmlText = ''
  console.log('parse target', tokens)
  for (const token of tokens) {
    const htmlTag = typeToHtmlTag(token.type)

    htmlText += `<${htmlTag}>${token.content}</${htmlTag}>\n`
  }
  return htmlText
}
