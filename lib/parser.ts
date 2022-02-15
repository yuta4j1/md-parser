import type { HtmlElementToken } from './token'

export const parse = (tokens: HtmlElementToken[]) => {
  let htmlText = ''
  for (const token of tokens) {
    const htmlTag = token.type

    if (token.innerTokens && token.innerTokens.length > 0) {
      const innerHtmlText = parse(token.innerTokens)
      htmlText += `<${htmlTag}>${innerHtmlText}</${htmlTag}>\n`
    } else {
      if (token.type === 'none') {
        htmlText += token.content
      } else {
        htmlText += `<${htmlTag}>${token.content}</${htmlTag}>\n`
      }
    }
  }
  return htmlText
}
