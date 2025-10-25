<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const route = useRoute()

// If you add more items, remember to update the styles for staggered transitions below
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

const { mobileMenuOpen: open, transitionDuration, toggle, routeChange } = useMobileMenu()

watch(width, (newWidth) => {
	if (newWidth >= 1024) {
		open.value = false
	}
})
</script>

<template>
	<UHeader
		:ui="{
			root: 'bg-secondary-600/90 border-secondary-700 shadow-2xl',
		}"
	>
		<template #title>
			<Logo class="z-20 h-10 w-auto" />
		</template>
		<UNavigationMenu :items="items" color="neutral" variant="pill" highlight />
		<template #right>
			<UButton
				class="absolute top-0 right-0 -bottom-px hidden w-56 place-content-center text-sm lg:grid"
				size="xl"
				color="primary"
				variant="solid"
				to="/contact"
				:ui="{}"
			>
				<span class="flex items-center gap-5 uppercase"> Neem contact op </span>
			</UButton>
		</template>

		<template #toggle>
			<UButton
				color="primary"
				variant="solid"
				class="absolute top-0 right-0 z-20 grid size-(--ui-header-height) place-content-center lg:hidden"
				title="Open navigatiemenu"
				aria-label="Open het navigatiemenu"
				@click="toggle"
			>
				<div class="swap">
					<UIcon
						name="heroicons:bars-3-bottom-right-20-solid"
						class="size-7 transition-all"
						:class="[!open ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0']"
					/>
					<UIcon
						name="heroicons:x-mark-20-solid"
						class="size-7 transition-all"
						:class="[open ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0']"
					/>
				</div>
			</UButton>
		</template>
	</UHeader>
	<Transition
		:duration="transitionDuration"
		:name="'mobile-menu' + (routeChange ? '-route' : '')"
	>
		<div v-if="open" class="menu-container fixed inset-0 top-(--ui-header-height) z-10">
			<UContainer class="grid h-full place-content-center gap-16">
				<UNavigationMenu
					:items="items"
					color="neutral"
					variant="link"
					orientation="vertical"
					highlight
					:ui="{
						root: 'font-serif -mt-12',
						list: 'space-y-8',
						item: 'menu-item',
						link: 'text-xl grid place-content-center',
					}"
				/>
				<UButton
					to="/contact"
					color="primary"
					variant="solid"
					size="xl"
					class="menu-item special"
					:style="{ '--menu-index': items.length + 2 }"
				>
					Neem contact op
				</UButton>
			</UContainer>
		</div>
	</Transition>
</template>

<style lang="postcss">
.swap {
	cursor: pointer;
	display: grid;
	place-content: center;
	position: relative;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
}

.swap > * {
	grid-column-start: 1;
	grid-row-start: 1;
}

.menu-item {
	transition: all 150ms ease-in-out;
	--stagger: 50ms;
	/* Note that --menu-transition-duration is set globally in main.css */
}

/* enter/leave transforms */
.mobile-menu-enter-from .menu-item {
	transform: translateY(1rem);
	opacity: 0;
	filter: blur(0.1rem);
}

/* Menu container needs a background to hide page content  */
.menu-container {
	background: var(--ui-bg);
	transition: background var(--menu-transition-duration) ease-in-out;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
	transition: all var(--menu-transition-duration) ease-in-out;
}

/* If route is changing, delay the menu closing to allow the new page to fully load before fading out the menu */
.mobile-menu-route-leave-active {
	transition: all var(--menu-transition-duration) ease-in-out
		calc(var(--menu-transition-duration) / 2);
}

.mobile-menu-enter-from {
	opacity: 0;
}

.mobile-menu-leave-to {
	transform: translateY(-1rem);
	opacity: 0;
	filter: blur(0.1rem);
}

/* base delay during enter */
.mobile-menu-enter-active,
.mobile-menu-enter-active .menu-item,
.mobile-menu-leave-active .menu-item {
	transition-delay: var(--menu-transition-duration);
}

/*
	staggered offsets for 3 items
	Add more if needed...
*/
.mobile-menu-enter-active .menu-item:nth-child(1) {
	transition-delay: calc(var(--menu-transition-duration) + calc(var(--stagger) * 0));
}
.mobile-menu-enter-active .menu-item:nth-child(2) {
	transition-delay: calc(var(--menu-transition-duration) + calc(var(--stagger) * 1));
}
.mobile-menu-enter-active .menu-item:nth-child(3) {
	transition-delay: calc(var(--menu-transition-duration) + calc(var(--stagger) * 2));
}

/*
	staggered offset for items outside loop (e.g. contact button)
	For items outside of nav menu we can set the --menu-index CSS variable
*/
.mobile-menu-enter-active .menu-item.special {
	transition-delay: calc(
		var(--menu-transition-duration) + calc(var(--stagger) * var(--menu-index))
	);
}
</style>
