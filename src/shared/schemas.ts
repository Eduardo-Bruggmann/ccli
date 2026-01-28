import { z } from 'zod'

export const SetNickMessageSchema = z.object({
  type: z.literal('set_nick'),
  payload: z.object({
    nickname: z
      .string()
      .min(2)
      .max(20)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Nickname can only contain letters, numbers, and underscores',
      ),
  }),
})

export const JoinMessageSchema = z.object({
  type: z.literal('join'),
  payload: z.object({
    channel: z.string().min(1),
  }),
})

export const ChatMessageSchema = z.object({
  type: z.literal('message'),
  payload: z.object({
    text: z.string().min(1),
  }),
})

export const ClientMessageSchema = z.union([
  SetNickMessageSchema,
  JoinMessageSchema,
  ChatMessageSchema,
])

export const ServerChatMessageSchema = z.object({
  type: z.literal('message'),
  payload: z.object({
    from: z.string(),
    text: z.string(),
  }),
})

export const ServerSystemMessageSchema = z.object({
  type: z.literal('system'),
  payload: z.object({
    text: z.string(),
  }),
})

export const ServerErrorMessageSchema = z.object({
  type: z.literal('error'),
  payload: z.object({
    text: z.string(),
  }),
})

export const ServerWelcomeMessageSchema = z.object({
  type: z.literal('welcome'),
  payload: z.object({
    nickname: z.string(),
    users: z.array(z.string()),
    channels: z.array(z.string()),
  }),
})

export const ServerMessageSchema = z.union([
  ServerChatMessageSchema,
  ServerSystemMessageSchema,
  ServerErrorMessageSchema,
  ServerWelcomeMessageSchema,
])
