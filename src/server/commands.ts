import { State, Client } from './state'
import { ClientMessageSchema, ServerMessage } from '../shared/protocol'

export function handleMessage(state: State, client: Client, raw: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    send(client, { type: 'error', payload: { text: 'Invalid JSON' } })
    return
  }

  const result = ClientMessageSchema.safeParse(parsed)

  if (!result.success) {
    send(client, {
      type: 'error',
      payload: { text: 'Invalid message format' },
    })
    return
  }

  const msg = result.data

  if (msg.type === 'set_nick') {
    if (client.nickname) {
      send(client, {
        type: 'error',
        payload: { text: 'Nickname already set' },
      })
      return
    }

    const nicknameTaken = [...state.clients.values()].some(
      (c) => c.nickname === msg.payload.nickname,
    )

    if (nicknameTaken) {
      send(client, {
        type: 'error',
        payload: { text: 'Nickname already in use' },
      })
      return
    }

    client.nickname = msg.payload.nickname

    send(client, {
      type: 'welcome',
      payload: {
        nickname: client.nickname,
        users: getUsers(state),
        channels: getChannels(state),
      },
    })

    return
  }

  if (!client.nickname) {
    send(client, {
      type: 'error',
      payload: { text: 'Set a nickname first' },
    })
    return
  }

  switch (msg.type) {
    case 'join':
      client.channel = msg.payload.channel

      send(client, {
        type: 'system',
        payload: { text: `Joined channel ${client.channel}` },
      })
      break

    case 'message':
      if (!client.channel) {
        send(client, {
          type: 'error',
          payload: { text: 'Join a channel first' },
        })
        return
      }

      broadcast(state, client.channel, {
        type: 'message',
        payload: {
          from: client.nickname,
          text: msg.payload.text,
        },
      })
      break
  }
}

function send(client: Client, msg: ServerMessage) {
  client.socket.send(JSON.stringify(msg))
}

function broadcast(state: State, channel: string, msg: ServerMessage) {
  for (const c of state.clients.values()) {
    if (c.channel === channel) {
      c.socket.send(JSON.stringify(msg))
    }
  }
}

function getUsers(state: State): string[] {
  return [...state.clients.values()]
    .map((c) => c.nickname)
    .filter((n): n is string => n !== null)
}

function getChannels(state: State): string[] {
  const channels = new Set<string>()

  for (const c of state.clients.values()) {
    if (c.channel) channels.add(c.channel)
  }

  return [...channels]
}
