<script lang="ts" setup>
import type { ImageOptions } from '@nuxt/image'

/**
 * Component props
 *
 * This component accepts all standard {@link ImageOptions} from Nuxt Image.
 * Additionally, some props (like `class`) are handled separately for the wrapper `<div>`.
 */
const props = withDefaults(
	defineProps<{
		direction?: 'left' | 'right' | 'up' | 'down'
		duration?: number
		src: ImageOptions['src']
		alt?: ImageOptions['alt']
		sizes?: ImageOptions['sizes']
		width?: number
		height?: number
		modifiers?: ImageOptions['modifiers']
		class?: string
	}>(),
	{
		duration: 300,
		direction: 'right',
	},
)
/**
 * Props that should not be passed to NuxtImg but to the wrapper div
 */
const nonImagePropKeys = ['class']

/**
 * Animation props that should not be passed to either
 * the image nor the wrapper
 */
const animationProps = ['direction', 'duration']

const wrapperProps = computed(() => {
	const result: Record<string, any> = {}
	for (const key in props) {
		if (nonImagePropKeys.includes(key) && !animationProps.includes(key)) {
			result[key] = props[key as keyof typeof props]
		}
	}
	return result
})

const imageProps = computed(() => {
	const result: Record<string, any> = {}
	for (const key in props) {
		if (!nonImagePropKeys.includes(key) && !animationProps.includes(key)) {
			result[key] = props[key as keyof typeof props]
		}
	}
	return result
})
</script>

<template>
	<div v-bind="wrapperProps" :class="['grid']">
		<NuxtImg v-bind="imageProps" class="h-full w-full object-cover object-center" />
	</div>
</template>
