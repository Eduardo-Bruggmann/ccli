import * as readline from 'readline'
import { socket } from './socket'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', (line) => {
  if (line.startsWith('/join')) {
    socket.send(
      JSON.stringify({
        type: 'join',
        payload: { channel: line.split(' ')[1] },
      }),
    )
    return
  }

  socket.send(
    JSON.stringify({
      type: 'message',
      payload: { text: line },
    }),
  )
})
