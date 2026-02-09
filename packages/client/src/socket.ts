import { ServerMessage, ServerMessageSchema } from '@shared/schemas'
import type { RawData } from 'ws'
import { WebSocket } from 'ws'

export const socket = new WebSocket('ws://localhost:8080')

export function sendJson(socket: WebSocket, msg: unknown) {
  socket.send(JSON.stringify(msg))
}

export function onServerMessage(
  socket: WebSocket,
  handler: (msg: ServerMessage) => void,
) {
  socket.on('message', data => {
    const msg = parseServerMessage(data.toString())
    if (msg) handler(msg)
  })
}

export function waitForServerMessage<T extends ServerMessage>(
  socket: WebSocket,
  predicate: (msg: ServerMessage) => msg is T,
  options?: { timeoutMs?: number },
): Promise<T>

export function waitForServerMessage(
  socket: WebSocket,
  predicate: (msg: ServerMessage) => boolean,
  options?: { timeoutMs?: number },
): Promise<ServerMessage>

export function waitForServerMessage(
  socket: WebSocket,
  predicate: (msg: ServerMessage) => boolean,
  options?: { timeoutMs?: number },
): Promise<ServerMessage> {
  const timeoutMs = options?.timeoutMs ?? 10000

  return new Promise((resolve, reject) => {
    const onMessage = (data: RawData) => {
      const msg = parseServerMessage(data.toString())
      if (!msg || !predicate(msg)) return

      cleanup()
      resolve(msg)
    }

    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Timeout waiting for server message'))
    }, timeoutMs)

    const cleanup = () => {
      clearTimeout(timer)
      socket.off('message', onMessage)
    }

    socket.on('message', onMessage)
  })
}

function parseServerMessage(text: string): ServerMessage | null {
  try {
    const result = ServerMessageSchema.safeParse(JSON.parse(text))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
