declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_PRE_COMMIT_LINT?: 'true' | 'false'
      DISABLE_PRE_PUSH_TYPECHECK?: 'true' | 'false'
      DEBUG?: 'true' | 'false'
      MODE: 'dev' | 'preview' | 'production'
      CLOUDINARY_CLOUD_NAME: string

      PLAUSIBLE_DOMAIN: string
      DISABLE_TRACKING?: 'true' | 'false'
      APP_URL: string
      API_TOKEN: string
      PUBLIC_API_TOKEN: string
      BLOCK_NON_SEO_BOTS?: 'true' | 'false'
      BLOCK_AI_BOTS?: 'true' | 'false'

      NUXT_HUB_PROJECT_KEY: string
      NUXT_HUB_PROJECT_SECRET_KEY: string

      NUXT_HUB_CLOUDFLARE_ACCOUNT_ID: string
      NUXT_HUB_CLOUDFLARE_API_TOKEN: string

      NUXT_HUB_WORKER_NAME: string
      NUXT_HUB_WORKER_PREVIEW_NAME: string

      NUXT_HUB_CLOUDFLARE_PROD_CACHE_NAMESPACE_ID: string
      NUXT_HUB_CLOUDFLARE_PREVIEW_CACHE_NAMESPACE_ID: string

      NUXT_HUB_CLOUDFLARE_PROD_KV_NAMESPACE_ID: string
      NUXT_HUB_CLOUDFLARE_PREVIEW_KV_NAMESPACE_ID: string

      NUXT_HUB_CLOUDFLARE_PROD_DB_ID: string
      NUXT_HUB_CLOUDFLARE_PREVIEW_DB_ID: string
    }
  }
}
export { }