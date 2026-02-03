import { z } from 'zod'

export const ChannelNameSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(
    /^[a-z0-9_-]+$/,
    'Channel name must be lowercase and contain only letters, numbers, _ or -',
  )

export const NicknameSchema = z
  .string()
  .min(1)
  .max(20)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Nickname must contain only letters, numbers, "_" or "-", and no spaces',
  )

const SetNickMessageSchema = z.object({
  type: z.literal('set_nick'),
  payload: z.object({
    nickname: NicknameSchema,
  }),
})

const CheckNickMessageSchema = z.object({
  type: z.literal('check_nick'),
  payload: z.object({
    nickname: NicknameSchema,
  }),
})

const JoinMessageSchema = z.object({
  type: z.literal('join'),
  payload: z.object({
    channel: ChannelNameSchema,
  }),
})

const ChatMessageSchema = z.object({
  type: z.literal('message'),
  payload: z.object({
    text: z.string().min(1).max(500),
  }),
})

export const ClientMessageSchema = z.union([
  SetNickMessageSchema,
  CheckNickMessageSchema,
  JoinMessageSchema,
  ChatMessageSchema,
])

const ServerChatMessageSchema = z.object({
  type: z.literal('message'),
  payload: z.object({
    from: z.string(),
    text: z.string().min(1).max(500),
  }),
})

const ServerErrorMessageSchema = z.object({
  type: z.literal('error'),
  payload: z.object({
    message: z.string(),
  }),
})

const ServerNickCheckSchema = z.object({
  type: z.literal('nick_check'),
  payload: z.object({
    nickname: z.string(),
    available: z.boolean(),
  }),
})

const ServerWelcomeMessageSchema = z.object({
  type: z.literal('welcome'),
  payload: z.object({
    nickname: z.string(),
    users: z.array(z.string()),
    channels: z.array(z.string()),
  }),
})

const ServerUserJoinedSchema = z.object({
  type: z.literal('user_joined'),
  payload: z.object({
    nickname: z.string(),
    channel: z.string(),
  }),
})

const ServerUserLeftSchema = z.object({
  type: z.literal('user_left'),
  payload: z.object({
    nickname: z.string(),
  }),
})

const ServerNickChangedSchema = z.object({
  type: z.literal('nick_changed'),
  payload: z.object({
    oldNick: z.string(),
    newNick: z.string(),
  }),
})

const ServerMenuSchema = z.object({
  type: z.literal('menu'),
  payload: z.object({
    self: z.string(),
    users: z.array(z.string()),
    channels: z.array(z.string()),
  }),
})

export const ServerMessageSchema = z.union([
  ServerChatMessageSchema,
  ServerErrorMessageSchema,
  ServerWelcomeMessageSchema,
  ServerUserJoinedSchema,
  ServerUserLeftSchema,
  ServerNickChangedSchema,
  ServerMenuSchema,
  ServerNickCheckSchema,
])
