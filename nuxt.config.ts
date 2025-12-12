import identity from './data/identity'
import { identity as coreIdentity } from './data/global'
import projects from './data/projects'
import { joinURL } from 'ufo'

const isDebug = process.env.DEBUG === 'true' || false
const isDev = process.env.MODE === 'dev'
const isPreview = process.env.MODE === 'preview'
const isProd = process.env.MODE === 'production'

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
    minify: !isDebug,
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
    experimental: {
      openAPI: true
    }
  },
  // List of debug options for various Nuxt subsystems
  debug: {
    nitro: isDebug,
    hydration: isDebug || isDev || isPreview,
    watchers: isDebug || isDev,
    router: isDebug,
    templates: isDebug,
    modules: isDebug,
    hooks: {
      server: isDebug,
      client: isDebug,
    },
  },

  ssr: true,

  // Disable caching in development to prevent confusion
  $development: {
    routeRules: {
      '/**': { cache: false },
    },
  },

  $production: {
    routeRules: {
      '/': {
        ssr: true,
        cache: {
          maxAge: 60 * 60 * 24
        }
      },
      '/**': {
        ssr: true,
        cache: {
          maxAge: 60 * 60 * 24
        }
      },
      '/projecten/**': {
        ssr: true,
        cache: {
          maxAge: 60 * 60 * 24
        }
      },
      '/api/**': {
        ssr: false,
        cache: false
      },
      '/images/**': {
        ssr: false,
        cache: false
      },
    },

  },


  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    public: {
      apiToken: process.env.PUBLIC_API_TOKEN,
      tracking: {
        disabled: process.env.DISABLE_TRACKING === 'true' || false,
      },
      mode: {
        value: process.env.MODE,
        isDev: isDev,
        isPreview: process.env.MODE === 'preview',
        isProd: isProd,
      }
    }
  },

  hub: {
    analytics: false,
    blob: true,
    cache: true,
    database: true,
    kv: true,
  },

  plausible: {
    domain: process.env.PLAUSIBLE_DOMAIN,
    ignoredHostnames: [''],
    autoPageviews: true,
    apiHost: 'https://plausible.io',
    proxy: false,
    autoOutboundTracking: true
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'neutral', 'info', 'warning', 'error', 'success',]
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
    provider: 'ipx',

    providers: {
      cloudinary: {
        baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUDNAME}/image/upload`,
        modifiers: {
          quality: '80',
        }
      },
      cloudflare: {
        baseURL: '/images/'
      },
      none: {}
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


  // SEO Stuff from NuxtSEO
  site: {
    name: coreIdentity.name,
    description: coreIdentity.description,
    url: process.env.APP_URL,
    indexable: isProd,
    env: process.env.MODE,
    debug: isDebug,
    titleSeparator: '|',
    defaultLocale: 'nl',
    language: 'nl_NL',
    trailingSlash: false
  },

  schemaOrg: {
    identity,
    debug: isDebug,
  },

  robots: {
    allow: [],
    disallow: [],
    sitemap: [],
    blockNonSeoBots: process.env.BLOCK_NON_SEO_BOTS === 'true' || false,
    blockAiBots: process.env.BLOCK_AI_BOTS === 'true' || false,
    debug: isDebug,
  },

  linkChecker: {
    debug: isDebug,
    report: {
      // Publishes the report after deployment at /link-checker/link-checker-report.[html|json|md]
      publish: true,

      // File formats to generate
      html: true,
      markdown: true,
      json: true,
    }
  },

  sitemap: {
    autoLastmod: true,
    debug: isDebug,
    urls: () => {
      return Object.values(projects).map((project) => ({
        loc: `/projecten/${project.slug}`,
        changefreq: 'yearly',
        priority: 0.7,
      }))
    }
  }
})
