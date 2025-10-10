<script setup lang="ts">
import { nl } from '@nuxt/ui/locale'

const config = useRuntimeConfig().public
</script>

<template>
	<UApp :toaster="{ expand: false }" :tooltip="{ delayDuration: 250 }" :locale="nl">
		<NuxtRouteAnnouncer />
		<NuxtLoadingIndicator
			:throttle="0"
			color="var(--color-primary-500)"
			error-color="var(--color-error-main)"
		/>

		<Header />
		<UMain
			class="relative pt-[var(--header-height)]"
			:class="[config.mode.isDev ? 'debug-screens' : '']"
		>
			<NuxtPage />
		</UMain>
		<Footer />
	</UApp>
</template>

<style lang="postcss">
body {
	background-color: var(--color-secondary-500);
}

.page-enter-active,
.page-leave-active {
	transition: all 0.15s;
}
.page-enter-from,
.page-leave-to {
	opacity: 0;
	filter: blur(0.2rem);
}
</style>
