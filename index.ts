import { tokenizer } from './lib/lexer'
import { parse } from './lib/parser'
import { htmlGenerator } from './lib/generator'

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
  const elementTokens = parse(mdTokens)
  const resultHtml = htmlGenerator(elementTokens)
  console.log('')
  console.log('parse result ↓')
  console.log(resultHtml)
}

main()
