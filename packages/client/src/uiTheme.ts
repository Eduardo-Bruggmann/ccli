export const NO_PREFIX_THEME = {
  prefix: '',
} as const

const COLOR = `\x1b[9${Math.floor(Math.random() * 8)}m`
const DIM = '\x1b[2m'
const NORMAL = '\x1b[22m'
const RESET = '\x1b[0m'

const CLOUD_CHARS = ['·', '.', ':', '*', '~', '^', '`', '°', '•']

function cloudSegment(length: number, density = 0.12) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out +=
      Math.random() < density
        ? CLOUD_CHARS[Math.floor(Math.random() * CLOUD_CHARS.length)]
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

const maxLen = Math.max(...artLines.map(l => l.length))
const leftPad = 10
const rightPad = 10

const topBottom = [
  cloudSegment(leftPad + maxLen + rightPad, 0.08),
  cloudSegment(leftPad + maxLen + rightPad, 0.06),
]

const framed = artLines.map(line => {
  const padded = line.padEnd(maxLen, ' ')
  const left = cloudSegment(leftPad)
  const right = cloudSegment(rightPad)
  return `${DIM}${left}${NORMAL}${padded}${DIM}${right}${NORMAL}`
})

export const asciiArt =
  `${COLOR}${DIM}${topBottom.join('\n')}${NORMAL}\n` +
  `${framed.join('\n')}\n` +
  `${DIM}${topBottom.slice().reverse().join('\n')}${RESET}`
