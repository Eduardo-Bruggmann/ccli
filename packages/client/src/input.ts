import { input } from '@inquirer/prompts'
import { NO_PREFIX_THEME } from './uiTheme'

export async function prompt(
  text: string,
  options?: {
    validate?: (value: string) => boolean | string | Promise<boolean | string>
  },
): Promise<string> {
  return (
    await input({
      message: text,
      validate: options?.validate,
      theme: NO_PREFIX_THEME,
    })
  ).trim()
}
