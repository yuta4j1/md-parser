import { tokenizer } from './lib/lexer'

function main() {
  const markdownText = `## testです
hogehoge **nikoniko** fuga \`test\` b

`
  tokenizer(markdownText)
}

main()
