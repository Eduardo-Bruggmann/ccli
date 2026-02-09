import readline from 'readline'

export type ChatPrompt = {
  readLine: (prompt: string) => Promise<string>
  printLine: (line: string) => void
  updatePrompt: (prompt: string) => void
  close: () => void
}

export function createChatPrompt(): ChatPrompt {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  })

  let currentPrompt = ''

  const setPrompt = (prompt: string) => {
    currentPrompt = prompt.endsWith(' ') ? prompt : prompt + ' '
    rl.setPrompt(currentPrompt)
  }

  const readLine = (prompt: string): Promise<string> => {
    setPrompt(prompt)

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(currentPrompt)

    return new Promise(resolve => {
      rl.once('line', line => resolve(line.trim()))
    })
  }

  const printLine = (line: string) => {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(line + '\n')

    rl.setPrompt(currentPrompt)
    rl.prompt()
  }

  const updatePrompt = (prompt: string) => {
    setPrompt(prompt)
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    rl.prompt()
  }

  const close = () => {
    process.stdin.removeAllListeners('keypress')
    process.stdin.resume()
  }

  return { readLine, printLine, updatePrompt, close }
}
