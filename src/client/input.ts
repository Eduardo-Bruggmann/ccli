import readline from 'readline'

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export function prompt(text: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      resolve(answer.trim())
    })
  })
}
