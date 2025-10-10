<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
	{
		label: 'Studio',
		to: '/studio',
	},
	{
		label: 'Projecten',
		to: '/projecten',
		active: route.path.startsWith('/projecten'),
	},
	{
		label: 'Werkwijze',
		to: '/werkwijze',
	},
])
</script>

<template>
	<UHeader :ui="{ root: 'bg-secondary-600/90 border-secondary-700 shadow-2xl' }">
		<template #title>
			<Logo class="h-10 w-auto" />
		</template>
		<UNavigationMenu :items="items" color="neutral" variant="pill" highlight />
		<template #right>
			<UButton
				class="absolute top-0 right-0 -bottom-0.25 grid w-56 place-content-center text-sm"
				size="xl"
				color="primary"
				variant="solid"
				to="/contact"
				:ui="{}"
			>
				<span class="flex items-center gap-5 uppercase"> Neem contact op </span>
			</UButton>
		</template>
	</UHeader>
</template>
