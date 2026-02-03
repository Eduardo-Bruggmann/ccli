import { ClientMessageSchema, ServerMessageSchema } from './schemas'
import { z } from 'zod'

export type ClientMessage = z.infer<typeof ClientMessageSchema>
export type ServerMessage = z.infer<typeof ServerMessageSchema>

export { ClientMessageSchema, ServerMessageSchema }
