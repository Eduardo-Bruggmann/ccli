let interactivePromptActive = false
let queuedLines: string[] = []
let realtimePrinter: ((line: string) => void) | null = null

export function beginInteractivePrompt() {
  interactivePromptActive = true
}

export function endInteractivePrompt() {
  interactivePromptActive = false
  flushQueuedLines()
}

export function setRealtimePrinter(printer: ((line: string) => void) | null) {
  realtimePrinter = printer
  flushQueuedLines()
}

export function printLine(line: string) {
  if (realtimePrinter) {
    realtimePrinter(line)
  } else if (interactivePromptActive) {
    queuedLines.push(line)
  } else {
    console.log(line)
  }
}

export function printLines(lines: string[]) {
  lines.forEach(printLine)
}

function flushQueuedLines() {
  if (queuedLines.length === 0 || interactivePromptActive) return

  const lines = queuedLines
  queuedLines = []

  const print = realtimePrinter ?? console.log
  lines.forEach(print)
}
