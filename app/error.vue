<script setup lang="ts">
import type { NuxtError } from '#app'

import { nl } from '@nuxt/ui/locale'

const config = useRuntimeConfig().public

useSeoMeta({
	title: 'Pagina niet gevonden',
	description: 'Het lijkt erop dat deze pagina niet bestaat. Ga terug naar de homepagina.',
})

const props = defineProps<{ error: NuxtError }>()

const router = useRouter()
const lastPath = computed(() => router.options.history.state.back)

/**
 * Computed title based on error status code
 * @returns Localized error title string
 */
const title = computed(() => {
	if (props.error.statusCode === 400) return 'Er ging iets mis'
	if (props.error.statusCode === 404) return 'Pagina niet gevonden'
	if (props.error.statusCode === 500) return 'Er ging iets mis'
	return 'Er is een fout opgetreden'
})

/**
 * Computed description based on error status code
 * @returns Localized error description string
 */
const description = computed(() => {
	if (props.error.statusCode === 400)
		return 'Ververs deze pagina of ga terug naar de vorige pagina.'
	if (props.error.statusCode === 404) return 'Deze pagina is niet (meer) beschikbaar.'
	if (props.error.statusCode === 500)
		return 'Ververs deze pagina of ga terug naar de vorige pagina.'
	return 'Ververs deze pagina of ga terug naar de vorige pagina.'
})

// Finish loading indicator when component is mounted (this does not always happen automatically on error pages)
const { isLoading, finish } = useLoadingIndicator()
onMounted(() => {
	if (isLoading.value) {
		finish()
	}
})

const { mobileMenuOpen, menuClosing, setHooks } = useMobileMenu()
setHooks()
</script>

<template>
	<Body class="bg-secondary-500" :class="[config.mode.isDev ? 'debug-screens' : '']">
		<UApp :toaster="{ expand: false }" :tooltip="{ delayDuration: 250 }" :locale="nl">
			<NuxtRouteAnnouncer />
			<NuxtLoadingIndicator
				:throttle="0"
				color="var(--color-primary-500)"
				error-color="var(--color-error-main)"
			/>

			<Header />
			<UMain
				class="content relative pt-[var(--header-height)]"
				:class="{
					'menu-open': mobileMenuOpen,
					'menu-closing': menuClosing,
				}"
			>
				<UContainer
					class="flex h-full flex-col items-start justify-center gap-6 py-12 lg:py-24"
				>
					<h1 class="text-primary mb-6 text-2xl md:text-4xl">
						<Hand no-margin>
							<span class="block md:inline">{{
								error && error.statusCode ? error.statusCode : 500
							}}</span>
							<br class="my-4" >
							<span class="hidden md:inline">|</span> {{ title }}
						</Hand>
					</h1>
					<p class="mb-6 text-xl">{{ description }}</p>
					<UFieldGroup color="primary" size="xl" class="flex-wrap">
						<UButton
							to="/"
							icon="heroicons:home"
							class="sm:justify-left grow justify-center sm:grow-0"
						>
							Naar home
						</UButton>
						<ClientOnly>
							<UButton
								v-if="lastPath"
								:to="lastPath.toString()"
								trailing-icon="heroicons:chevron-right-16-solid"
								variant="soft"
								color="primary"
								class="sm:justify-left grow justify-center sm:grow-0"
							>
								Naar vorige pagina
							</UButton>
						</ClientOnly>
					</UFieldGroup>
				</UContainer>
			</UMain>

			<DevOnly>
				<div class="py-8" />
			</DevOnly>
			<Footer
				class="content"
				:class="{
					'menu-open': mobileMenuOpen,
					'menu-closing': menuClosing,
				}"
			/>
		</UApp>
	</Body>
</template>
