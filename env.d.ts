declare global {
  type Mode = 'dev' | 'preview' | 'next' | 'production'
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_PRE_COMMIT_LINT?: 'true' | 'false'
      DISABLE_PRE_PUSH_TYPECHECK?: 'true' | 'false'
      DEBUG?: 'true' | 'false'
      MODE: Mode
      WORKER_MODE?: Mode

      PLAUSIBLE_DOMAIN: string
      DISABLE_TRACKING?: 'true' | 'false'
      APP_URL: string
      BLOCK_NON_SEO_BOTS?: 'true' | 'false'
      BLOCK_AI_BOTS?: 'true' | 'false'

      API_TOKEN: string
      GPT_TOKEN: string
      PUBLIC_API_TOKEN: string
      SUPER_SECRET_CONFIRMATION_PASSWORD: string

      NUXT_HUB_PROJECT_KEY: string
      NUXT_HUB_PROJECT_SECRET_KEY: string

      NUXT_HUB_CLOUDFLARE_ACCOUNT_ID: string
      NUXT_HUB_CLOUDFLARE_API_TOKEN: string

      NUXT_HUB_WORKER_NAME: string

      NUXT_HUB_CLOUDFLARE_CACHE_NAMESPACE_ID: string
      NUXT_HUB_CLOUDFLARE_KV_NAMESPACE_ID: string
      NUXT_HUB_CLOUDFLARE_DB_ID: string
    }
  }
}

export { }