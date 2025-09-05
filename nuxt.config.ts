// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxthub/core',
    '@nuxtjs/seo',
    '@vueuse/nuxt'
  ],
  css: ['~/assets/css/main.css'],

  hub: {
    analytics: true,
    blob: false,
    cache: true,
    database: false,
    kv: true,
  }
})