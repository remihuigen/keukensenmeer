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
    '@vueuse/nuxt',
    '@nuxtjs/plausible'
  ],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      tracking: {
        disabled: process.env.DISABLE_TRACKING === 'true' || false,
      },
    }
  },

  hub: {
    analytics: true,
    blob: false,
    cache: true,
    database: false,
    kv: true,
  },

  plausible: {
    domain: process.env.PLAUSIBLE_DOMAIN,
    ignoredHostnames: [''],
    autoPageviews: true,
    apiHost: 'https://plausible.io',
    proxy: true,
    autoOutboundTracking: true
  }
})