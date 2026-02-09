export const promptTheme = {
  prefix: '',
}

export function clearScreen() {
  process.stdout.write('\x1Bc')
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── ANSI helpers ──

const ESC = '\x1b['
const RESET = `${ESC}0m`

export const c = {
  reset: RESET,
  bold: (s: string) => `${ESC}1m${s}${RESET}`,
  dim: (s: string) => `${ESC}2m${s}${RESET}`,
  cyan: (s: string) => `${ESC}36m${s}${RESET}`,
  green: (s: string) => `${ESC}32m${s}${RESET}`,
  yellow: (s: string) => `${ESC}33m${s}${RESET}`,
  magenta: (s: string) => `${ESC}35m${s}${RESET}`,
  gray: (s: string) => `${ESC}90m${s}${RESET}`,
  white: (s: string) => `${ESC}97m${s}${RESET}`,
} as const

export function centerText(text: string, width: number): string {
  const pad = Math.max(0, Math.floor((width - text.length) / 2))
  return ' '.repeat(pad) + text
}

// ── ASCII art ──

const artColor = `${ESC}9${Math.floor(Math.random() * 8)}m`
const dim = `${ESC}2m`
const normal = `${ESC}22m`

const cloudChars = ['·', '.', ':', '*', '~', '^', '`', '°', '•']

function cloudSegment(length: number, density = 0.12) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out +=
      Math.random() < density
        ? cloudChars[Math.floor(Math.random() * cloudChars.length)]
        : ' '
  }
  return out
}

const artLines = [
  '           ______   ______   __        ____',
  '          / ____/  / ____/  / /       /  _/',
  '         / /      / /      / /        / /  ',
  '        / /___   / /___   / /___    _/ /   ',
  '        \\____/   \\____/  /_____/   /___/  ',
]

const leftPad = 10
const rightPad = 10
const maxLen = Math.max(...artLines.map(l => l.length))

const topBottom = [
  cloudSegment(leftPad + maxLen + rightPad, 0.08),
  cloudSegment(leftPad + maxLen + rightPad, 0.06),
]

const framed = artLines.map(line => {
  const left = cloudSegment(leftPad)
  const right = cloudSegment(rightPad)
  const padded = line.padEnd(maxLen, ' ')
  return `${dim}${left}${normal}${padded}${dim}${right}${normal}`
})

export const asciiArt =
  `${artColor}${dim}${topBottom.join('\n')}${normal}\n` +
  `${framed.join('\n')}\n` +
  `${dim}${topBottom.slice().reverse().join('\n')}${RESET}`
