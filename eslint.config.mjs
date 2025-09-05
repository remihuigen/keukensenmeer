// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'nuxt/nuxt-config-keys-order': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
)
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-html': 'error',
      'vue/max-attributes-per-line': ['error', { singleline: 5, multiline: 1 }]
    }
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  })
