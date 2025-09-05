export default defineNuxtPlugin({
  name: 'my-plugin',
  enforce: 'pre', // or 'post'
  parallel: true,
  async setup(_nuxtApp) {
    // this is the equivalent of a normal functional plugin
    const { message } = useExample()

    const pluginMessage = `From plugin: ${message}`

    console.log(pluginMessage)

    return {
      provide: {
        pluginMessage: pluginMessage
      }
    }
  },
  hooks: {
    // You can directly register Nuxt app runtime hooks here
    'app:created'() {
      console.log('Nuxt app instance created (from plugin)')
    }
  },
  env: {
    // Set this value to `false` if you don't want the plugin to run when rendering server-only or island components.
    islands: true
  }
})
