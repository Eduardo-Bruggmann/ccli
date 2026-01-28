import { z } from 'zod'
import { ClientMessageSchema, ServerMessageSchema } from './schemas'

export type ClientMessage = z.infer<typeof ClientMessageSchema>
export type ServerMessage = z.infer<typeof ServerMessageSchema>

export { ClientMessageSchema, ServerMessageSchema }
