import { socket } from './socket'

export function handleUserInput(input: string) {
  const trimmed = input.trim()

  if (!trimmed) return

  if (trimmed.startsWith('/nick')) {
    const nickname = trimmed.slice(6).trim()

    socket.send(
      JSON.stringify({
        type: 'set_nick',
        payload: { nickname },
      }),
    )
    return
  }

  if (trimmed.startsWith('/join')) {
    const channel = trimmed.slice(6).trim()

    socket.send(
      JSON.stringify({
        type: 'join',
        payload: { channel },
      }),
    )
    return
  }

  socket.send(
    JSON.stringify({
      type: 'message',
      payload: { text: trimmed },
    }),
  )
}
