import type { HtmlElementToken } from './token'

export const htmlGenerator = (tokens: HtmlElementToken[]): string => {
  let htmlText = ''
  for (const token of tokens) {
    const htmlTag = token.type

    if (token.innerTokens && token.innerTokens.length > 0) {
      const innerHtmlText = htmlGenerator(token.innerTokens)
      if (token.content === '') {
        htmlText += `<${htmlTag}>${innerHtmlText}</${htmlTag}>\n`
      } else {
        htmlText += `<${htmlTag}>${token.content}${innerHtmlText}</${htmlTag}>\n`
      }
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
