import { input } from '@inquirer/prompts'

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
    })
  ).trim()
}
