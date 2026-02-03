import { select, Separator } from '@inquirer/prompts'

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
  while (true) {
    renderMenuScreen(users)

    const choices: ChoiceArray = []

    if (channels.length === 0) {
      // TODO
      console.log('I need to handle the case of no channels available yet')
    }

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

    const selection = await select<MenuSelection>({
      message: 'ACTIONS',
      choices,
    })

    if (selection.type === 'commands') {
      await showCommandsScreen()
      continue
    }

    return selection
  }
}

function renderMenuScreen(users: string[]) {
  console.clear()
  console.log('====== MENU ======')
  console.log('')

  printList('Users:', users)
}

async function showCommandsScreen() {
  console.clear()
  console.log('====== COMMANDS ======')
  console.log('Here are the commands (fill this list later).')
  console.log('')

  await select({
    message: 'Back',
    choices: [{ name: 'Return to menu', value: true }],
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
    return
  }

  for (const item of items) {
    console.log(`  - ${formatItem ? formatItem(item) : item}`)
  }

  console.log('')
}
