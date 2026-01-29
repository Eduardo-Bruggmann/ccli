import WebSocket from 'ws'
import { ServerMessage } from '../shared/protocol'

export type Client = {
  socket: WebSocket
  nickname: string | null
  channel: string | null
}

export type ChannelHistory = ServerMessage[]

export type State = {
  clients: Map<WebSocket, Client>
  channels: Map<string, ChannelHistory>
}

export const state: State = {
  clients: new Map(),
  channels: new Map(),
}
