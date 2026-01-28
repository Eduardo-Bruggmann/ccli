import WebSocket from 'ws'
import { ServerMessageSchema, ServerMessage } from '../shared/protocol'
import { renderMessage } from './render'

type Listener = (msg: ServerMessage) => void
type OpenListener = () => void

let messageListener: Listener | null = null
let openListener: OpenListener | null = null

export function onServerMessage(fn: Listener) {
  messageListener = fn
}

export function onOpen(fn: OpenListener) {
  openListener = fn
}

export const socket = new WebSocket('ws://localhost:8080')

socket.on('open', () => {
  console.log('Connected to server\n')

  if (openListener) openListener()
})

socket.on('message', (data: WebSocket.Data) => {
  let parsed: unknown

  try {
    parsed = JSON.parse(data.toString())
  } catch {
    console.error('Received invalid JSON from server')
    return
  }

  const result = ServerMessageSchema.safeParse(parsed)

  if (!result.success) {
    console.error('Invalid server message format')
    return
  }

  const msg = result.data

  renderMessage(msg)

  if (messageListener) {
    messageListener(msg)
  }
})
