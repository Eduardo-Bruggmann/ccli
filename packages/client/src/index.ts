import {
  socket,
  onServerMessage,
  sendJson,
  waitForServerMessage,
} from './socket'
import {
  printLine,
  printLines,
  setRealtimePrinter,
  endInteractivePrompt,
} from './ui'
import { NicknameSchema, type ServerMessage } from '@shared/schemas'
import { zodErrorMessage } from '@shared/utils'
import { createChatPrompt } from './chatPrompt'
import { clearScreen, c } from './render'
import { showMenu } from './menu'
import { prompt } from './input'
import { colorize, assignColor, resetColors } from './colors'

type MenuMessage = Extract<ServerMessage, { type: 'menu' }>

function isMenuMessage(msg: ServerMessage): msg is MenuMessage {
  return msg.type === 'menu'
}

socket.on('open', () => {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
})

async function main() {
  clearScreen()
  setupMessageHandler()

  const nickname = await getNickname()
  let menu = await setNicknameAndGetMenu(nickname)

  while (true) {
    const action = await showMenu(menu.payload.users, menu.payload.channels)

    if (action.type === 'exit') exitApp()

    sendJson(socket, { type: 'join', payload: { channel: action.channel } })
    clearScreen()
    endInteractivePrompt()

    const reason = await chatLoop(nickname)

    if (reason === 'exit') exitApp()

    sendJson(socket, { type: 'menu_request' })
    menu = await waitForServerMessage(socket, isMenuMessage)
  }
}

let onNickChanged: ((oldNick: string, newNick: string) => void) | null = null
let selfNick = ''

function setupMessageHandler() {
  onServerMessage(socket, msg => {
    switch (msg.type) {
      case 'message':
        printLine(`[${colorize(msg.payload.from)}] ${msg.payload.text}`)
        break
      case 'channel_history':
        clearScreen()
        resetColors()
        assignColor(selfNick)
        printLines(
          msg.payload.messages.map(m => `[${colorize(m.from)}] ${m.message}`),
        )
        break
      case 'nick_changed':
        onNickChanged?.(msg.payload.oldNick, msg.payload.newNick)
        break
      case 'system':
        printLine(c.cyan(`* ${msg.payload.message} *`))
        break
      case 'error':
        printLine(`Error: ${msg.payload.message}`)
        break
    }
  })
}

function exitApp(): never {
  socket.close()
  process.exit(0)
}

async function getNickname(): Promise<string> {
  return prompt('Enter your nickname:', {
    validate: async value => {
      const nickname = value.trim()

      const format = NicknameSchema.safeParse(nickname)
      if (!format.success) return zodErrorMessage(format.error)

      try {
        const available = await checkNicknameAvailable(nickname)
        return available ? true : 'Nickname already taken'
      } catch {
        return 'Could not check nickname availability. Try again.'
      }
    },
  })
}

async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  sendJson(socket, { type: 'check_nick', payload: { nickname } })

  const reply = await waitForServerMessage(
    socket,
    m => m.type === 'nick_check' && m.payload.nickname === nickname,
    { timeoutMs: 5000 },
  )

  if (reply.type !== 'nick_check') throw new Error('Unexpected server reply')

  return reply.payload.available
}

async function setNicknameAndGetMenu(nickname: string): Promise<MenuMessage> {
  sendJson(socket, { type: 'set_nick', payload: { nickname } })
  return waitForServerMessage(socket, isMenuMessage, { timeoutMs: 5000 })
}

type ChatExitReason = 'home' | 'exit'

async function chatLoop(nickname: string): Promise<ChatExitReason> {
  let currentNick = nickname
  selfNick = nickname
  const chat = createChatPrompt()
  setRealtimePrinter(chat.printLine)

  onNickChanged = (oldNick: string, newNick: string) => {
    if (oldNick === currentNick) {
      currentNick = newNick
      selfNick = newNick
      chat.updatePrompt(`[${colorize(currentNick)}]> `)
    } else {
      printLine(c.cyan(`* ${oldNick} is now ${newNick} *`))
    }
  }

  try {
    while (true) {
      const text = await chat.readLine(`[${colorize(currentNick)}]> `)

      if (!text) continue

      if (text.startsWith('/')) {
        const [cmd, ...args] = text.slice(1).split(' ')

        switch (cmd) {
          case 'home':
            sendJson(socket, { type: 'leave_channel' })
            return 'home'
          case 'join':
            sendJson(socket, {
              type: 'join',
              payload: { channel: args[0] },
            })
            continue
          case 'nick':
            sendJson(socket, {
              type: 'set_nick',
              payload: { nickname: args[0] },
            })
            continue
          case 'exit':
            return 'exit'
        }
      }

      sendJson(socket, { type: 'message', payload: { text } })
    }
  } finally {
    onNickChanged = null
    setRealtimePrinter(null)
    chat.close()
  }
}
