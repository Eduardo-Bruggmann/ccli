import { beginInteractivePrompt, endInteractivePrompt } from './ui'
import { input } from '@inquirer/prompts'
import { promptTheme } from './render'

export async function prompt(
  text: string,
  options?: {
    validate?: (value: string) => boolean | string | Promise<boolean | string>
  },
): Promise<string> {
  beginInteractivePrompt()
  try {
    return (
      await input({
        message: text,
        validate: options?.validate,
        theme: promptTheme,
      })
    ).trim()
  } finally {
    endInteractivePrompt()
  }
}
