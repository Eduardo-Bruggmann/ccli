import { ClientMessage, ClientMessageSchema } from '@shared/protocol'
import { zodErrorMessage } from './utils'
import { Client, state } from './state'

export function handleMessage(client: Client, text: string) {
  const msg = validateMessage(client, text)

  if (!msg) return

  switch (msg.type) {
    case 'check_nick': {
      const nick = msg.payload.nickname
      const taken = state.listUsers().includes(nick)

      client.send({
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

      const taken = state.listUsers().includes(nick)
      if (taken) {
        client.send({
          type: 'error',
          payload: { message: 'Nickname already taken' },
        })
        return
      }

      client.nickname = nick
      state.addClient(client)

      sendMenu(client)
      break

    case 'join':
      if (client.currentChannel) {
        const channel = state.getOrCreateChannel(client.currentChannel)
        channel.removeClient(client.nickname!)
      }

      state.joinChannel(client, msg.payload.channel)
      console.log(client.nickname + ' joined channel ' + client.currentChannel)
      break

    case 'message':
      client.send({
        type: 'message',
        payload: { text: msg.payload.text },
      })
      console.log(`Received message`)
      break
  }
}

function validateMessage(
  client: Client,
  text: string,
): ClientMessage | undefined {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    const err = {
      type: 'error',
      payload: { message: 'Invalid JSON received' },
    }

    client.send(err)
    return
  }

  const result = ClientMessageSchema.safeParse(parsed)

  if (!result.success) {
    const err = {
      type: 'error',
      payload: { message: zodErrorMessage(result.error) },
    }

    client.send(err)
    return
  }

  return result.data
}

function sendMenu(client: Client) {
  const users = state.listUsers(client.nickname!)

  const channels = state.listChannels()

  client.send({
    type: 'menu',
    payload: {
      self: client.nickname!,
      users,
      channels,
    },
  })
}
