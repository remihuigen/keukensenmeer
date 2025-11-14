<script lang="ts" setup>
import { useElementVisibility } from '@vueuse/core'

const props = withDefaults(
	defineProps<{
		direction?: 'up' | 'down' | 'left' | 'right' | 'none'
		/** Animation duration in ms */
		duration?: number
		/** Animation intensity in px */
		intensity?: number

		/**
		 * Optional delay before animation starts, in milliseconds.
		 * Useful for staggered reveals.
		 * @default 0
		 */
		delay?: number

		/**
		 * Animate only once when entering the viewport.
		 * If true, animation won't replay on re-entry.
		 * @default true
		 */
		once?: boolean

		/**
		 * Intersection observer root margin.
		 * @default "-10% 0px -10% 0px"
		 */
		rootMargin?: string

		/**
		 * Intersection observer visibility threshold.
		 * @default 0.5
		 */
		threshold?: number | number[]
	}>(),
	{
		direction: 'up',
		duration: 300,
		intensity: 10,
		delay: 0,
		once: true,
		rootMargin: '-10% 0px -10% 0px',
		threshold: 0.5,
	},
)

/**
 * Container element reference for visibility tracking.
 */
const containerRef = useTemplateRef<HTMLElement>('container')

/**
 * Track visibility of the container element.
 */
const elementIsVisible = useElementVisibility(containerRef, {
	once: props.once,
	rootMargin: props.rootMargin,
	threshold: props.threshold,
})

/**
 * Shadow state for items in viewport on mount to prevent double triggering.
 * Prevents animation reset when element leaves viewport if `once` is true.
 */
const isVisible = shallowRef(false)

/**
 * Update visibility state with once-only logic.
 */
watch(elementIsVisible, (newValue: boolean) => {
	if (isVisible.value && props.once) {
		return // Already visible and only once, do nothing
	}
	isVisible.value = newValue
})
</script>

<template>
	<div
		ref="container"
		:style="{
			'--duration': duration + 'ms',
			'--intensity': intensity + 'px',
			'--delay': delay + 'ms',
		}"
		class="fade"
		:class="!isVisible ? props.direction : 'fade-in'"
	>
		<slot />
	</div>
</template>

<style lang="postcss" scoped>
.fade {
	transition:
		transform var(--duration) ease var(--delay),
		opacity var(--duration) ease var(--delay);
	opacity: 0;
}

.fade.up {
	transform: translateY(var(--intensity));
}
.fade.down {
	transform: translateY(calc(-1 * var(--intensity)));
}
.fade.left {
	transform: translateX(var(--intensity));
}
.fade.right {
	transform: translateX(calc(-1 * var(--intensity)));
}

.fade.fade-in {
	opacity: 1;
	transform: translateY(0) translateX(0);
}
</style>
