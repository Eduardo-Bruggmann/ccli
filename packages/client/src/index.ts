import { socket, onJsonMessage, onceJsonMessage, sendJson } from './socket'
import { NicknameSchema } from '@shared/schemas'
import { clearScreen } from './utils'
import { showMenu } from './menu'
import { prompt } from './input'
import { WebSocket } from 'ws'

socket.on('open', async () => {
  clearScreen()
  console.log('Connected to server')

  while (true) {
    const nickname = await getNickname(socket)
    const reply = await setNicknameAndGetMenu(socket, nickname)

    if (reply.type === 'menu') {
      const payload = reply.payload as { users: string[]; channels: string[] }

      while (true) {
        const action = await showMenu(payload.users, payload.channels)

        if (action.type === 'join') {
          sendJson(socket, {
            type: 'join',
            payload: { channel: action.channel },
          })
          break
        }

        if (action.type === 'exit') {
          socket.close()
          process.exit(0)
        }
      }

      break
    }

    console.log(`Error: ${reply.payload?.message ?? 'Unknown error'}`)
  }

  onJsonMessage(socket, msg => {
    if (msg.type === 'message')
      console.log(`[${msg.payload.from}] ${msg.payload.text}`)
    if (msg.type === 'error') console.log(`Error: ${msg.payload.message}`)
  })
})

async function checkNicknameAvailable(socket: WebSocket, nickname: string) {
  sendJson(socket, { type: 'check_nick', payload: { nickname } })

  const reply = await onceJsonMessage(
    socket,
    msg => msg.type === 'nick_check' && msg.payload?.nickname === nickname,
  )

  return Boolean(reply.payload?.available)
}

async function getNickname(socket: WebSocket) {
  return prompt('Enter your nickname:', {
    validate: async value => {
      const nickname = value.trim()

      const format = NicknameSchema.safeParse(nickname)

      if (!format.success) {
        return format.error.issues[0]?.message ?? 'Invalid nickname'
      }

      try {
        const ok = await checkNicknameAvailable(socket, nickname)
        return ok ? true : 'Nickname already taken'
      } catch {
        return 'Could not check nickname availability. Try again.'
      }
    },
  })
}

async function setNicknameAndGetMenu(socket: WebSocket, nickname: string) {
  sendJson(socket, { type: 'set_nick', payload: { nickname } })
  return onceJsonMessage(
    socket,
    msg => msg.type === 'menu' || msg.type === 'error',
  )
}
