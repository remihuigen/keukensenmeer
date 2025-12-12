import type { Nuxt } from '@nuxt/schema'

export function resolveCompatibilityDate(nuxt: Nuxt): string {
  const date = nuxt.options.compatibilityDate

  if (typeof date === 'object' && 'default' in date && date.default) {
    return date.default
  }

  return date?.toString() ?? '2025-12-12'
}
