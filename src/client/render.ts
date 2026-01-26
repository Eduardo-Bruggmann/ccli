import { ServerMessage } from '../shared/protocol'

export function renderMessage(msg: ServerMessage) {
  switch (msg.type) {
    case 'message':
      console.log(`[${msg.payload.from}] ${msg.payload.text}`)
      break
    case 'system':
      console.log(`* ${msg.payload.text} *`)
      break
    case 'error':
      console.log(`! ${msg.payload.text} !`)
      break
  }
}
