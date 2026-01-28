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

    case 'welcome':
      console.log('\n=== Welcome ===')
      console.log(`You are: ${msg.payload.nickname}\n`)

      console.log('Online users:')
      if (msg.payload.users.length === 0) {
        console.log('  (no other users online)')
      } else {
        msg.payload.users.forEach((u) => {
          console.log(`  - ${u}`)
        })
      }

      console.log('\nAvailable channels:')
      if (msg.payload.channels.length === 0) {
        console.log('  (no channels available)')
      } else {
        msg.payload.channels.forEach((c) => {
          console.log(`  - ${c}`)
        })
      }

      console.log('')
      break
  }
}
