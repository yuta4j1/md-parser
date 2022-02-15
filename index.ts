import { tokenizer } from './lib/lexer'
import { parse } from './lib/parser'

function main() {
  const argText = `## testです
hogehoge **test用マークダウン**  
fuga \`test\` bbb
- test
  - hoge
  - fuga
- list
- aaa

`
  const mdTokens = tokenizer(argText)
  const result = parse(mdTokens)
  console.log('')
  console.log('parse result ↓')
  console.log(result)
}

main()
