import { tokenizer } from './lib/lexer'
import { parse } from './lib/parser'

function main() {
  const argText = `## testです
hogehoge **nikoniko** fuga \`test\` b

`
  const mdTokens = tokenizer(argText)
  const result = parse(mdTokens)
  console.log('parse result: ', result)
}

main()
