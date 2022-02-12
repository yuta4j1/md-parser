export type MdType = 'emphasis' | 'code' | 'cancel' | 'text'

export type Token = {
  type: MdType
  content: string
  childToken?: Token[]
}
