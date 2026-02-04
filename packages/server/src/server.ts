import { WebSocketServer, WebSocket } from 'ws'
import { handleMessage } from './commands'
import { state, Client } from './state'

export function startServer(port: number = 8080) {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (socket: WebSocket) => {
    const client = new Client(socket)

    socket.on('message', data => {
      handleMessage(client, data.toString())
    })

    socket.on('close', () => {
      console.log('Client disconnected')
      state.removeClient(client)
    })
  })

  console.log(`WebSocket server running on ws://localhost:${port}`)
}
