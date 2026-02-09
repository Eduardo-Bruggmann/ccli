const ESC = '\x1b['
const RESET = `${ESC}0m`

const PALETTE = [
  `${ESC}33m`, // yellow
  `${ESC}35m`, // magenta
  `${ESC}32m`, // green
  `${ESC}91m`, // bright red
  `${ESC}94m`, // bright blue
  `${ESC}93m`, // bright yellow
  `${ESC}95m`, // bright magenta
  `${ESC}92m`, // bright green
]

const nickColors = new Map<string, string>()
let nextIndex = 0

function nextColor(): string {
  const color = PALETTE[nextIndex]
  nextIndex = (nextIndex + 1) % PALETTE.length
  return color
}

export function assignColor(nickname: string) {
  if (!nickColors.has(nickname)) {
    nickColors.set(nickname, nextColor())
  }
}

export function colorize(nickname: string): string {
  const color = nickColors.get(nickname) ?? nextColor()
  if (!nickColors.has(nickname)) {
    nickColors.set(nickname, color)
  }
  return `${color}${nickname}${RESET}`
}

export function resetColors() {
  nickColors.clear()
  nextIndex = 0
}
