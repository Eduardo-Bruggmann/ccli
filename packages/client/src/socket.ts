import { WebSocket } from 'ws'

export const socket = new WebSocket('ws://localhost:8080')

export function onceJsonMessage(
  socket: WebSocket,
  predicate: (msg: any) => boolean,
): Promise<any> {
  return new Promise(resolve => {
    const onMessage = (data: unknown) => {
      const raw = typeof data === 'string' ? data : (data as Buffer).toString()
      const msg = safeJsonParse(raw)
      if (!msg) return
      if (!predicate(msg)) return

      socket.off('message', onMessage)
      resolve(msg)
    }

    socket.on('message', onMessage)
  })
}

export function onJsonMessage(socket: WebSocket, handler: (msg: any) => void) {
  socket.on('message', data => {
    const msg = safeJsonParse(data.toString())
    if (!msg) return
    handler(msg)
  })
}

export function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function sendJson(socket: WebSocket, msg: unknown) {
  socket.send(JSON.stringify(msg))
}
