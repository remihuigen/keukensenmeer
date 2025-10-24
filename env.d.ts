declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_PRE_COMMIT_LINT?: 'true' | 'false'
      DISABLE_PRE_PUSH_TYPECHECK?: 'true' | 'false'
      DEBUG?: 'true' | 'false'
      MODE: 'dev' | 'preview' | 'production'
      CLOUDINARY_CLOUD_NAME: string
      NUXT_HUB_PROJECT_KEY: string
      PLAUSIBLE_DOMAIN: string
      DISABLE_TRACKING?: 'true' | 'false'
      APP_URL: string
      API_TOKEN: string
      BLOCK_NON_SEO_BOTS?: 'true' | 'false'
      BLOCK_AI_BOTS?: 'true' | 'false'
    }
  }
}
export { }