// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxthub/core',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@nuxtjs/plausible'
  ],
  css: ['~/assets/css/main.css'],

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    public: {
      tracking: {
        disabled: process.env.DISABLE_TRACKING === 'true' || false,
      },
      mode: {
        value: process.env.MODE,
        isDev: process.env.MODE === 'dev',
        isStaging: process.env.MODE === 'staging',
        isProd: process.env.MODE === 'prod',
      }
    }
  },

  hub: {
    analytics: false,
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
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary']
    }
  },

  fonts: {
    families: [
      { name: 'Playfair Display', provider: 'google', weights: [200, 400, 500, 700] },
      { name: 'NorthwellClean', provider: 'local', weights: [400] },
      { name: 'Objektiv Mk2', provider: 'local', weights: [400, 700] },
    ]
  },

  image: {
    provider: 'cloudinary',
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUDNAME}/image/upload`,
      modifiers: {
        quality: '80',
      }
    },
    providers: {
      video: {
        provider: 'cloudinary',
        options: {
          baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUDNAME}/video/upload`,
        }
      }
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'nl'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Onderwijsloket' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      noscript: [
        { innerHTML: 'Je hebt Javascript nodig om deze website te kunnen gebruiken. Pas je browserinstellingen in om verder te gaan!' }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/ico',
          href: '/favicon.ico'
        },
        ...[16, 32, 48, 96, 144, 192, 512].map(size => ({
          rel: 'icon',
          type: 'image/png',
          href: `/favicon/kem_logo-icon_${size}.png`,
          sizes: `${size}x${size}`
        }))
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },

  },
})
