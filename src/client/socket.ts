import WebSocket from 'ws'
import { ServerMessage } from '../shared/protocol'
import { renderMessage } from './render'

export const socket = new WebSocket('ws://localhost:8080')

socket.on('open', () => {
  console.log('Connected to server')
})

socket.on('message', (data: WebSocket.Data) => {
  const msg = JSON.parse(data.toString()) as ServerMessage
  renderMessage(msg)
})
