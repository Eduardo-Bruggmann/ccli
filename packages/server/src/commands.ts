import { ClientMessage, ClientMessageSchema } from '@shared/schemas'
import { zodErrorMessage } from '@shared/utils'
import { Client, state } from './state'

export function handleMessage(client: Client, text: string) {
  const msg = parseClientMessage(client, text)
  if (!msg) return

  switch (msg.type) {
    case 'check_nick': {
      const available = !state.listUsers().includes(msg.payload.nickname)
      client.send({
        type: 'nick_check',
        payload: { nickname: msg.payload.nickname, available },
      })
      break
    }

    case 'set_nick': {
      const nick = msg.payload.nickname
      const oldNick = client.nickname

      if (state.listUsers().includes(nick) && oldNick !== nick) {
        sendError(client, 'Nickname already taken')
        return
      }

      if (oldNick) {
        state.changeNickname(client, nick)

        const nickChangedMsg = {
          type: 'nick_changed',
          payload: { oldNick, newNick: nick },
        }

        client.send(nickChangedMsg)

        if (client.currentChannel) {
          state.broadcastToChannel(client.currentChannel, nickChangedMsg, nick)
        }
      } else {
        client.nickname = nick
        state.addClient(client)

        state.broadcastSystem(
          {
            type: 'system',
            payload: { message: `${nick} connected` },
          },
          nick,
        )
      }

      sendMenu(client)
      break
    }

    case 'join': {
      const oldChannel = client.currentChannel

      if (oldChannel) {
        state.broadcastToChannel(oldChannel, {
          type: 'system',
          payload: { message: `${client.nickname} left #${oldChannel}` },
        })
      }

      state.joinChannel(client, msg.payload.channel)

      state.broadcastToChannel(msg.payload.channel, {
        type: 'system',
        payload: {
          message: `${client.nickname} joined #${msg.payload.channel}`,
        },
      })
      break
    }

    case 'leave_channel': {
      if (!client.nickname) {
        sendError(client, 'Set your nickname first')
        return
      }

      const oldChannel = client.currentChannel
      if (!oldChannel) break

      state.leaveChannel(client)

      state.broadcastToChannel(oldChannel, {
        type: 'system',
        payload: { message: `${client.nickname} left #${oldChannel}` },
      })
      break
    }

    case 'message': {
      if (!client.nickname) {
        sendError(client, 'Set your nickname first')
        return
      }

      if (!client.currentChannel) {
        sendError(client, 'Join a channel first')
        return
      }

      state
        .getOrCreateChannel(client.currentChannel)
        .addMessage({ from: client.nickname, message: msg.payload.text })

      state.broadcastToChannel(
        client.currentChannel,
        {
          type: 'message',
          payload: { from: client.nickname, text: msg.payload.text },
        },
        client.nickname,
      )
      break
    }

    case 'menu_request':
      sendMenu(client)
      break
  }
}

function parseClientMessage(
  client: Client,
  text: string,
): ClientMessage | undefined {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    sendError(client, 'Invalid JSON received')
    return
  }

  const result = ClientMessageSchema.safeParse(parsed)
  if (!result.success) {
    sendError(client, zodErrorMessage(result.error))
    return
  }

  return result.data
}

function sendError(client: Client, message: string) {
  client.send({ type: 'error', payload: { message } })
}

function sendMenu(client: Client) {
  if (!client.nickname) {
    sendError(client, 'Set your nickname first')
    return
  }

  client.send({
    type: 'menu',
    payload: {
      self: client.nickname,
      users: state.listUsers(client.nickname),
      channels: state.listChannels(),
    },
  })
}
