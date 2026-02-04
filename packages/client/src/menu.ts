import { select, Separator } from '@inquirer/prompts'
import { asciiArt, NO_PREFIX_THEME } from './uiTheme'
import { clearScreen } from './utils'

type ChoiceArray = Array<
  | { name: string; value: MenuSelection; disabled?: boolean }
  | InstanceType<typeof Separator>
>

type MenuSelection = MenuAction | { type: 'commands' }

export type MenuAction = { type: 'join'; channel: string } | { type: 'exit' }

export async function showMenu(
  users: string[],
  channels: string[],
): Promise<MenuAction> {
  return runMenu(users, channels)
}

async function runMenu(
  users: string[],
  channels: string[],
): Promise<MenuAction> {
  renderMenuScreen(users)

  const selection = await select<MenuSelection>({
    message: 'ACTIONS',
    choices: buildChoices(channels),
    theme: NO_PREFIX_THEME,
  })

  if (selection.type === 'commands') {
    await showCommandsScreen()
    return runMenu(users, channels)
  }

  return selection
}

function buildChoices(channels: string[]): ChoiceArray {
  const choices: ChoiceArray = []

  choices.push(new Separator('\n----- Join a Channel -----'))

  for (const channel of channels) {
    choices.push({
      name: `#${channel}`,
      value: { type: 'join', channel },
    })
  }

  choices.push(new Separator('\n----- Options -----'))
  choices.push({ name: 'Commands', value: { type: 'commands' } })
  choices.push({ name: 'Exit', value: { type: 'exit' } })

  return choices
}

function renderMenuScreen(users: string[]) {
  clearScreen()
  console.log(asciiArt)
  console.log('====== MENU ======')
  console.log('')

  printList('Users:', users)
}

async function showCommandsScreen() {
  clearScreen()
  console.log('====== COMMANDS ======')
  console.log('Here are the commands (fill this list later).')
  console.log('')

  await select({
    message: '',
    choices: [{ name: 'Return to menu', value: true }],
    theme: NO_PREFIX_THEME,
  })
}

function printList(
  title: string,
  items: string[],
  formatItem?: (s: string) => string,
) {
  console.log(title)

  if (items.length === 0) {
    console.log('  (none)')
    console.log('')
    return
  }

  for (const item of items) {
    console.log(`  - ${formatItem ? formatItem(item) : item}`)
  }

  console.log('')
}
