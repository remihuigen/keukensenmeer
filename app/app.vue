<script setup lang="ts">
import { nl } from '@nuxt/ui/locale'

const { mobileMenuOpen, shiftLeft, shiftRight, lockPageScroll, resetScrollLock } = useMobileMenu()

watch(mobileMenuOpen, lockPageScroll, { immediate: false })
onUnmounted(resetScrollLock)
</script>

<template>
	<UApp :toaster="{ expand: false }" :tooltip="{ delayDuration: 250 }" :locale="nl">
		<NuxtRouteAnnouncer />
		<NuxtLoadingIndicator
			:throttle="0"
			color="var(--color-primary-500)"
			error-color="var(--color-error-main)"
		/>
		<DevOnly>
			<span class="debug-screens-wrapper" style="z-index: 9999">
				<span class="debug-screens" />
			</span>
		</DevOnly>
		<Header />
		<UMain
			class="content relative pt-[var(--header-height)]"
			:class="[
				shiftLeft && mobileMenuOpen ? 'shift-left' : '',
				shiftRight && mobileMenuOpen ? 'shift-right' : '',
			]"
		>
			<NuxtPage />
		</UMain>
		<Footer
			class="content"
			:class="[
				shiftLeft && mobileMenuOpen ? 'shift-left' : '',
				shiftRight && mobileMenuOpen ? 'shift-right' : '',
			]"
		/>
	</UApp>
</template>

<style lang="postcss">
.debug-screens-wrapper {
	position: fixed;
	bottom: 0;
	left: 0;
}

body {
	background-color: var(--color-secondary-500);
}
</style>
