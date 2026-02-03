import { NicknameSchema } from '@shared/schemas'
import { showMenu } from './menu'
import { prompt } from './input'
import { WebSocket } from 'ws'

export const socket = new WebSocket(`ws://localhost:8080`)

socket.on('open', async () => {
  console.clear()
  console.log('Connected to server')

  while (true) {
    const nickname = await getNickname(socket)
    const reply = await setNicknameAndGetMenu(socket, nickname)

    if (reply.type === 'menu') {
      const payload = reply.payload as { users: string[]; channels: string[] }

      while (true) {
        const action = await showMenu(payload.users, payload.channels)

        if (action.type === 'join') {
          socket.send(
            JSON.stringify({
              type: 'join',
              payload: { channel: action.channel },
            }),
          )
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

  socket.on('message', data => {
    const raw = data.toString()
    const msg = safeJsonParse(raw)
    if (!msg) return

    if (msg.type === 'message')
      console.log(`[${msg.payload.from}] ${msg.payload.text}`)
    if (msg.type === 'error') console.log(`Error: ${msg.payload.message}`)
  })
})

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function onceMessage(
  socket: WebSocket,
  predicate: (msg: any) => boolean,
): Promise<any> {
  return new Promise(resolve => {
    const onMessage = (data: unknown) => {
      const raw = typeof data === 'string' ? data : (data as Buffer).toString()
      const msg = safeJsonParse(raw)
      if (!msg) return
      if (!predicate(msg)) return

      socket.off('message', onMessage)
      resolve(msg)
    }

    socket.on('message', onMessage)
  })
}

async function checkNicknameAvailable(socket: WebSocket, nickname: string) {
  socket.send(JSON.stringify({ type: 'check_nick', payload: { nickname } }))

  const reply = await onceMessage(
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
  socket.send(JSON.stringify({ type: 'set_nick', payload: { nickname } }))
  return onceMessage(socket, msg => msg.type === 'menu' || msg.type === 'error')
}