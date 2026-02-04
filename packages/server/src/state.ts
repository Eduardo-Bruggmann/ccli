import type { WebSocket } from 'ws'

export class Client {
  private readonly socket: WebSocket
  private _nickname: string | null = null
  private _currentChannel: string | null = null

  constructor(socket: WebSocket) {
    this.socket = socket
  }

  get nickname(): string | null {
    return this._nickname
  }

  set nickname(nick: string | null) {
    this._nickname = nick
  }

  get currentChannel(): string | null {
    return this._currentChannel
  }

  _setChannel(channel: string | null) {
    this._currentChannel = channel
  }

  send(data: unknown) {
    this.socket.send(JSON.stringify(data))
  }
}

export type ChannelMessage = {
  from: string
  message: string
}

export class Channel {
  private readonly _name: string
  private readonly clients: Set<string> = new Set()
  private readonly history: ChannelMessage[] = []
  private readonly MAX_HISTORY = 150

  constructor(name: string) {
    this._name = name
  }

  get name(): string {
    return this._name
  }

  hasClient(nickname: string): boolean {
    return this.clients.has(nickname)
  }

  addClient(nickname: string) {
    this.clients.add(nickname)
  }

  removeClient(nickname: string) {
    this.clients.delete(nickname)
  }

  listClients(): string[] {
    return [...this.clients]
  }

  addMessage(message: ChannelMessage) {
    this.history.push(message)
    this.trimHistory()
  }

  getHistory(): ChannelMessage[] {
    return [...this.history]
  }

  private trimHistory() {
    while (this.history.length > this.MAX_HISTORY) {
      this.history.shift()
    }
  }
}

export class State {
  private readonly clients: Map<string, Client> = new Map()
  private readonly channels: Map<string, Channel> = new Map()

  addClient(client: Client) {
    if (!client.nickname) return
    this.clients.set(client.nickname, client)
  }

  removeClient(client: Client) {
    if (!client.nickname) return

    if (client.currentChannel) {
      const channel = this.channels.get(client.currentChannel)
      channel?.removeClient(client.nickname)
    }

    this.clients.delete(client.nickname)
  }

  getClient(nickname: string): Client | undefined {
    return this.clients.get(nickname)
  }

  listUsers(except?: string): string[] {
    return [...this.clients.keys()].filter(n => n !== except)
  }

  getOrCreateChannel(name: string): Channel {
    let channel = this.channels.get(name)

    if (!channel) {
      channel = new Channel(name)
      this.channels.set(name, channel)
    }

    return channel
  }

  listChannels(): string[] {
    return [...this.channels.keys()]
  }

  joinChannel(client: Client, channelName: string) {
    if (!client.nickname) return

    if (client.currentChannel) {
      const oldChannel = this.channels.get(client.currentChannel)
      oldChannel?.removeClient(client.nickname)
    }

    const channel = this.getOrCreateChannel(channelName)
    channel.addClient(client.nickname)
    client._setChannel(channelName)
  }

  broadcastToChannel(channelName: string, data: unknown) {
    const channel = this.channels.get(channelName)
    if (!channel) return

    for (const nick of channel.listClients()) {
      const client = this.clients.get(nick)
      client?.send(data)
    }
  }

  broadcastSystem(data: unknown) {
    for (const client of this.clients.values()) {
      client.send(data)
    }
  }
}

export const state = new State()

state.getOrCreateChannel('general')
