import { ClientMessage, ClientMessageSchema } from '@shared/protocol'
import { zodErrorMessage } from './utils'
import { Client, state } from './state'

export function validateMessage(client: Client, text: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    send(client, {
      type: 'error',
      payload: { message: 'Invalid JSON received' },
    })
    return
  }

  const result = ClientMessageSchema.safeParse(parsed)
  if (!result.success) {
    send(client, {
      type: 'error',
      payload: { message: zodErrorMessage(result.error) },
    })
    return
  }

  const msg = result.data
  handleMessage(client, msg)
}

function handleMessage(client: Client, msg: ClientMessage) {
  switch (msg.type) {
    case 'check_nick': {
      const nick = msg.payload.nickname
      const taken = state.clients.has(nick)

      send(client, {
        type: 'nick_check',
        payload: {
          nickname: nick,
          available: !taken,
        },
      })
      break
    }

    case 'set_nick':
      const nick = msg.payload.nickname

      const taken = state.clients.has(nick)
      if (taken) {
        send(client, {
          type: 'error',
          payload: { message: 'Nickname already taken' },
        })
        return
      }

      client.nickname = nick
      state.clients.set(nick, client)

      sendMenu(client)
      break

    case 'join':
      if (client.currentChannel) {
        const channel = state.channels.get(client.currentChannel)
        channel?.clients.delete(client.nickname!)
      }

      client.currentChannel = msg.payload.channel
      state.channels.get(client.currentChannel)?.clients.add(client.nickname!)
      console.log(client.nickname + ' joined channel ' + client.currentChannel)
      break

    case 'message':
      send(client, msg.payload.text)
      console.log(`Received message`)
      break
  }
}

function send(client: Client, msg: unknown) {
  client.socket.send(JSON.stringify(msg))
}

function sendMenu(client: Client) {
  const users = [...state.clients.keys()].filter(
    nick => nick !== client.nickname,
  )

  const channels = [...state.channels.keys()]

  send(client, {
    type: 'menu',
    payload: {
      self: client.nickname!,
      users,
      channels,
    },
  })
}
