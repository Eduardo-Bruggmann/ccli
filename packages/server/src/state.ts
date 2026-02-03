import type { WebSocket } from 'ws'

export type Client = {
  socket: WebSocket
  nickname: string | null
  currentChannel: string | null
}

export type Channel = {
  name: string
  clients: Set<string>
  history: Array<{ nickname: string; text: string }>
}

export type State = {
  clients: Map<string, Client>
  channels: Map<string, Channel>
}

export const state: State = {
  clients: new Map(),
  channels: new Map(),
}

state.channels.set('general', {
  name: 'general',
  clients: new Set(),
  history: [],
})
