import identity from './data/identity'
import { identity as coreIdentity } from './data/global'
import projects from './data/projects'

import { createResolver } from '@nuxt/kit'

const isDebug = process.env.DEBUG === 'true' || false
const isDev = process.env.MODE === 'dev'
const isProd = process.env.MODE === 'production'
const isPreview = process.env.MODE === 'preview'

const { resolvePath } = createResolver(import.meta.url)

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
    '@nuxtjs/plausible',
  ],


  nitro: {
    minify: process.env.DEBUG !== 'true',
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
    experimental: {
      openAPI: true
    },

    preset: 'cloudflare_module',
    // cloudflare: {
    //   deployConfig: true,
    //   nodeCompat: true,

    //   wrangler: {
    //     name: isPreview ? 'keukensenmeer-preview' : 'keukensenmeer',
    //     kv_namespaces: [
    //       { binding: 'CACHE', id: process.env.NUXT_HUB_CLOUDFLARE_CACHE_NAMESPACE_ID || '' }
    //     ],
    //     observability: {
    //       logs: {
    //         enabled: true,
    //         head_sampling_rate: 1,
    //         invocation_logs: true,
    //       }
    //     }
    //   }
    // },
    // storage: {
    //   cache: {
    //     driver: await resolvePath('./config/cache/driver.mjs'),
    //     binding: 'CACHE'
    //   }
    // }
  },

  hub: {
    analytics: false,
    blob: false,
    cache: true,
    database: false,
    kv: false,
    projectUrl: process.env.APP_URL
  },

  css: ['~/assets/css/main.css'],
  debug: isDebug,
  ssr: true,

  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    public: {
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
