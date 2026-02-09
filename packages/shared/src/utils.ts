import { ZodError } from 'zod'

export function zodErrorMessage(err: ZodError): string {
  if (!err.issues.length) {
    return 'Invalid message format'
  }

  return err.issues.map(i => i.message).join('\n')
}
