import { State, Client } from './state'
import { ClientMessage, ServerMessage } from '../shared/protocol'

export function handleMessage(state: State, client: Client, raw: string) {
  let msg: ClientMessage

  try {
    msg = JSON.parse(raw)
  } catch {
    send(client, { type: 'error', payload: { text: 'Invalid JSON' } })
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
