export type MdType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'list'
  | 'emphasis'
  | 'code'
  | 'cancel'
  | 'text'

export type MdToken = {
  type: MdType
  content: string
  indent?: number
}

export type HtmlTagType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'ul'
  | 'li'
  | 'em'
  | 'code'
  | 's'
  | 'none'

export type HtmlElementToken = {
  type: HtmlTagType
  content: string
  innerTokens?: HtmlElementToken[]
}
