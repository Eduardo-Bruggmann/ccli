import { WebSocketServer, WebSocket } from 'ws'
import { state } from './state'
import { handleMessage } from './commands'

export function startServer(port = 8080) {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (socket: WebSocket) => {
    const client = {
      socket,
      nickname: null,
      channel: null,
    }

    state.clients.set(socket, client)

    socket.on('message', (data) => {
      handleMessage(state, client, data.toString())
    })

    socket.on('close', () => {
      const nickname = client.nickname

      state.clients.delete(socket)

      if (nickname) {
        for (const c of state.clients.values()) {
          c.socket.send(
            JSON.stringify({
              type: 'user_left',
              payload: { nickname },
            }),
          )
        }
      }
    })
  })

  console.log(`Server listening on ws://localhost:${port}`)
}
