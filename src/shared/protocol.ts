export type ClientMessage =
  | { type: 'join'; payload: { channel: string } }
  | { type: 'message'; payload: { text: string } }

export type ServerMessage =
  | { type: 'message'; payload: { from: string; text: string } }
  | { type: 'system'; payload: { text: string } }
  | { type: 'error'; payload: { text: string } }
