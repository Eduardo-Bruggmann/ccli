import { WebSocketServer, WebSocket } from 'ws'
import { validateMessage } from './commands'
import { state, Client } from './state'

export function startServer(port: number = 8080) {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (socket: WebSocket) => {
    const client: Client = {
      socket,
      nickname: null,
      currentChannel: null,
    }

    socket.on('message', data => {
      validateMessage(client, data.toString())
    })

    socket.on('close', () => {
      console.log('Client disconnected')
      state.clients.delete(client.nickname!)
      // Additional cleanup can be done here (e.g., removing from channels)
    })
  })

  console.log(`WebSocket server running on ws://localhost:${port}`)
}
