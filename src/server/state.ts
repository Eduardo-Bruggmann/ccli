import WebSocket from 'ws'

export type Client = {
  socket: WebSocket
  nickname: string | null
  channel: string | null
}

export type State = {
  clients: Map<WebSocket, Client>
}

export const state: State = {
  clients: new Map(),
}
