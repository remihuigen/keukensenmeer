declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_PRE_COMMIT_LINT: 'true' | 'false'
      DEBUG?: 'true' | 'false'
      MODE: 'dev' | 'staging' | 'prod'
      CLOUDINARY_CLOUD_NAME: string
      NUXT_HUB_PROJECT_KEY: string
      NUXT_UI_PRO_LICENSE: string
      PLAUSIBLE_DOMAIN: string
      DISABLE_TRACKING?: 'true' | 'false'
      APP_URL: string
      GITHUB_RELEASE_APP_ID: string
      GITHUB_RELEASE_APP_CLIENT_ID: string
      GITHUB_RELEASE_APP_CLIENT_SECRET: string
      API_TOKEN: string
    }
  }
}
export { }