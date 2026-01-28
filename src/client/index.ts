import { socket, onServerMessage, onOpen } from './socket'
import { prompt, rl } from './input'

let readyForChat = false

async function start() {
  const nickname = await prompt('Enter your nickname: ')

  socket.send(
    JSON.stringify({
      type: 'set_nick',
      payload: { nickname },
    }),
  )
}

onOpen(() => {
  start()
})

onServerMessage(async (msg) => {
  if (msg.type === 'error' && !readyForChat) {
    const nickname = await prompt('Enter a different nickname: ')
    socket.send(
      JSON.stringify({
        type: 'set_nick',
        payload: { nickname },
      }),
    )
    return
  }

  if (msg.type === 'welcome') {
    const channel = await prompt('Choose a channel: ')

    socket.send(
      JSON.stringify({
        type: 'join',
        payload: { channel },
      }),
    )

    readyForChat = true
    console.log('\nYou can start chatting\n')

    rl.on('line', (line: string) => {
      if (!line.trim()) return

      socket.send(
        JSON.stringify({
          type: 'message',
          payload: { text: line },
        }),
      )
    })
  }
})
