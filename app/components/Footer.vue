<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
	{
		label: 'Jouw privacy',
		to: '/privacy',
	},
]

const year = useState('footer-year', () => new Date().getFullYear())
</script>

<template>
	<UFooter :ui="{ root: 'bg-secondary-600' }">
		<template #left>
			<p class="text-muted text-sm">Keukens & Meer © {{ year }}</p>
		</template>

		<template #right>
			<UNavigationMenu :items="items" color="neutral" variant="pill" />
		</template>
	</UFooter>
</template>
