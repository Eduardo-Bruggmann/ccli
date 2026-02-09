import type { WebSocket } from 'ws'

export class Client {
  private readonly socket: WebSocket
  nickname: string | null = null
  currentChannel: string | null = null

  constructor(socket: WebSocket) {
    this.socket = socket
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
  private readonly clients = new Set<string>()
  private readonly history: ChannelMessage[] = []
  private readonly MAX_HISTORY = 150

  constructor(readonly name: string) {}

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
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift()
    }
  }

  getHistory(): ChannelMessage[] {
    return [...this.history]
  }
}

export class State {
  private readonly clients = new Map<string, Client>()
  private readonly channels = new Map<string, Channel>()

  addClient(client: Client) {
    if (!client.nickname) return
    this.clients.set(client.nickname, client)
  }

  removeClient(client: Client) {
    if (!client.nickname) return

    if (client.currentChannel) {
      const channel = this.channels.get(client.currentChannel)
      if (channel) {
        channel.removeClient(client.nickname)
        this.cleanupEmptyChannel(channel)
      }
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

    client.send({
      type: 'channel_history',
      payload: { channel: channel.name, messages: channel.getHistory() },
    })

    client.currentChannel = channelName
  }

  leaveChannel(client: Client) {
    if (!client.nickname || !client.currentChannel) return

    const channel = this.channels.get(client.currentChannel)
    if (channel) {
      channel.removeClient(client.nickname)
      this.cleanupEmptyChannel(channel)
    }

    client.currentChannel = null
  }

  broadcastToChannel(channelName: string, data: unknown, exceptNick?: string) {
    const channel = this.channels.get(channelName)
    if (!channel) return

    for (const nick of channel.listClients()) {
      if (nick !== exceptNick) {
        this.clients.get(nick)?.send(data)
      }
    }
  }

  changeNickname(client: Client, newNick: string) {
    const oldNick = client.nickname
    if (!oldNick) return

    this.clients.delete(oldNick)
    client.nickname = newNick
    this.clients.set(newNick, client)

    if (client.currentChannel) {
      const channel = this.channels.get(client.currentChannel)
      if (channel) {
        channel.removeClient(oldNick)
        channel.addClient(newNick)
      }
    }
  }

  broadcastSystem(data: unknown, exceptNick?: string) {
    for (const [nick, client] of this.clients.entries()) {
      if (nick !== exceptNick) {
        client.send(data)
      }
    }
  }

  private cleanupEmptyChannel(channel: Channel) {
    if (
      channel.listClients().length === 0 &&
      channel.getHistory().length > 1 &&
      channel.name !== 'general'
    ) {
      this.channels.delete(channel.name)
    }
  }
}

export const state = new State()

state.getOrCreateChannel('general')
