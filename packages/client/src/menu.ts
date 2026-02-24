import {
  beginInteractivePrompt,
  endInteractivePrompt,
  setRealtimePrinter,
} from './ui'
import {
  promptTheme,
  clearScreen,
  asciiArt,
  sleep,
  c,
  centerText,
} from './render'
import { select, Separator } from '@inquirer/prompts'

let pendingUsers: string[] | null = null
let menuAbort: AbortController | null = null

export function updateMenuUsers(users: string[]) {
  pendingUsers = users
  menuAbort?.abort()
}

type MenuSelection = MenuAction | { type: 'commands' }

export type MenuAction = { type: 'join'; channel: string } | { type: 'exit' }

const BOX_W = 45
const hr = c.gray('─'.repeat(BOX_W))
const hrDouble = c.gray('═'.repeat(BOX_W))

function header(title: string) {
  console.log(hrDouble)
  console.log(c.bold(c.white(centerText(title, BOX_W))))
  console.log(hrDouble)
}

export async function showMenu(
  initialUsers: string[],
  channels: string[],
): Promise<MenuAction> {
  setRealtimePrinter(null)
  let users = initialUsers
  pendingUsers = null
  let skipAnimation = false

  while (true) {
    if (pendingUsers) {
      users = pendingUsers
      pendingUsers = null
    }

    menuAbort = new AbortController()

    clearScreen()
    console.log(asciiArt)
    console.log()

    if (!skipAnimation) {
      await sleep(400)
      if (pendingUsers) {
        skipAnimation = true
        continue
      }
    }

    header('M E N U')

    if (!skipAnimation) {
      await sleep(100)
      if (pendingUsers) {
        skipAnimation = true
        continue
      }
    }

    console.log()
    printUsers(users)

    beginInteractivePrompt()

    let selection: MenuSelection
    try {
      selection = await select<MenuSelection>(
        {
          message: '',
          choices: buildChoices(channels),
          theme: promptTheme,
        },
        { signal: menuAbort.signal },
      )
    } catch {
      endInteractivePrompt()
      menuAbort = null
      if (pendingUsers) {
        skipAnimation = true
        continue
      }
      throw new Error('Menu aborted')
    }

    endInteractivePrompt()
    menuAbort = null
    skipAnimation = false

    if (selection.type !== 'commands') return selection

    await showCommandsScreen()
  }
}

function buildChoices(channels: string[]) {
  return [
    new Separator(c.gray('\n   ┌── Channels ──────────────────┐')),
    ...channels.map(channel => ({
      name: c.cyan(`   #${channel}`),
      value: { type: 'join' as const, channel },
    })),
    new Separator(c.gray('  └──────────────────────────────┘')),
    new Separator(''),
    { name: c.yellow('  ? Commands'), value: { type: 'commands' as const } },
    { name: c.magenta('  ✕ Exit'), value: { type: 'exit' as const } },
  ]
}

async function showCommandsScreen() {
  clearScreen()
  console.log()
  header('C O M M A N D S')
  console.log()
  console.log(c.gray('  Available while in a channel:'))
  console.log()
  printCmd('/home', 'return to menu')
  printCmd('/join <channel>', 'join/create a channel')
  printCmd('/nick <nickname>', 'change your nickname')
  printCmd('/exit', 'exit program')
  console.log()
  console.log(hr)
  console.log()

  beginInteractivePrompt()
  await select({
    message: '',
    choices: [{ name: c.gray('← Back to menu'), value: true }],
    theme: promptTheme,
  }).finally(() => endInteractivePrompt())
}

function printCmd(cmd: string, desc: string) {
  console.log(`  ${c.cyan(cmd.padEnd(20))} ${c.dim(desc)}`)
}

function printUsers(users: string[]) {
  console.log(c.bold('  Online'))
  console.log(hr)

  if (users.length === 0) {
    console.log(c.dim('    (none)'))
  } else {
    for (const user of users) {
      console.log(`    ${c.green('●')} ${user}`)
    }
  }

  console.log()
}
