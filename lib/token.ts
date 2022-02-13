// TODO: 字句解析用のトークンと、HTML要素へ書き下すためのツリー用トークンを分けた方が良さそう。
// 字句解析の出力は `Token` 列、構文解析の出力は `HtmlElementToken` 列のようになるイメージ
// 字句解析用のトークンには、childToken要素は不要。

export type MdType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'list'
  | 'emphasis'
  | 'code'
  | 'cancel'
  | 'text'

export type Token = {
  type: MdType
  content: string
  childToken?: Token[] // 不要？
}

// export type HtmlTagType =
//   | 'h1'
//   | 'h2'
//   | 'h3'
//   | 'h4'
//   | 'h5'
//   | 'h6'
//   | 'p'
//   | 'span'
//   | 'ul'
//   | 'li'
//   | 'em'
//   | 'code'
//   | 's'

// export type HtmlElementToken = {
//   type: MdType
//   content: string
//   innerTokens?: HtmlElementToken[]
// }
