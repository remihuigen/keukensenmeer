<script setup lang="ts">
import { nl } from '@nuxt/ui/locale'

const config = useRuntimeConfig().public

</script>

<template>

  <Body class="bg-secondary-500" :class="[config.mode.isDev ? 'debug-screens' : '']">
    <UApp :toaster="{ expand: false }" :tooltip="{ delayDuration: 250 }" :locale="nl">
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator :throttle="0" color="var(--color-primary-500)" error-color="var(--color-error-main)" />

      <UMain class="relative">
        <NuxtPage />
      </UMain>

    </UApp>
  </Body>
</template>
