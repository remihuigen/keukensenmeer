<script lang="ts" setup>
import type { ImageOptions } from '@nuxt/image'

import { useElementVisibility } from '@vueuse/core'

/**
 * Animation control props.
 */
interface AnimationProps {
	/**
	 * Direction of the reveal animation.
	 * Controls whether width or height expands, and from which side.
	 * @default "right"
	 */
	direction?: 'up' | 'down' | 'left' | 'right'

	/**
	 * Duration of the expand animation, in milliseconds.
	 * @default 500
	 */
	duration?: number

	/**
	 * Optional delay before animation starts, in milliseconds.
	 * Useful for staggered reveals.
	 * @default 0
	 */
	delay?: number

	/**
	 * Animate only once when entering the viewport.
	 * If true, animation won’t replay on re-entry.
	 * @default true
	 */
	once?: boolean

	/**
	 * Intersection observer root margin.
	 * @default "0px 0px -10% 0px"
	 */
	rootMargin?: string

	/**
	 * Intersection observer visibility threshold.
	 * @default 0.1
	 */
	threshold?: number | number[]
}

/**
 * Props forwarded to NuxtImg.
 */
interface ImageProps {
	/** Image source */
	src: string
	/** Alt text */
	alt?: string
	/** Nuxt image responsive sizes */
	sizes?: string
	/** Explicit width */
	width?: number
	/** Explicit height */
	height?: number
	/** Nuxt image modifiers */
	modifiers?: ImageOptions['modifiers']

	/**
	 * Enables a panning effect on the image background property,
	 * seperate from the reveal animation
	 * @default true
	 */
	pan?: boolean
	/** Direction of the pan effect. Defaults to the animation direction */
	panDirection?: 'up' | 'down' | 'left' | 'right'
	/** Duration of the pan effect, in milliseconds */
	panDuration?: number
}

const props = withDefaults(defineProps<AnimationProps & ImageProps>(), {
	direction: 'right',
	duration: 500,
	delay: 0,
	once: true,
	rootMargin: '0px 0px -10% 0px',
	threshold: 0.1,
	pan: true,
	panDirection: undefined,
	panDuration: 8000,
})

/**
 * Determine whether we’re expanding width or height.
 */
const isHorizontal = computed(() => ['left', 'right'].includes(props.direction))

/**
 * Track visibility of the container
 */
const container = useTemplateRef('container')
const isVisible = useElementVisibility(container, {
	once: props.once,
	rootMargin: props.rootMargin,
	threshold: props.threshold,
})

/**
 * Reactive size of the container.
 * Needed for width and height calculations.
 *
 * Reset values on resize, and remove listener on unmount.
 */
const containerSize = reactive({ width: 0, height: 0 })

function setContainerSize() {
	if (container.value) {
		const rect = container.value.getBoundingClientRect()
		containerSize.width = rect.width
		containerSize.height = rect.height
	}
}

onMounted(() => {
	setContainerSize()
	window.addEventListener('resize', setContainerSize)
})
onBeforeUnmount(() => {
	window.removeEventListener('resize', setContainerSize)
})

const wrapperStyle = computed(() => {
	/*
	 * Expand container width or height when visible, based on direction prop.
	 */
	return {
		overflow: 'hidden',
		height: isHorizontal.value ? '100%' : isVisible.value ? `${containerSize.height}px` : '0px',
		width: !isHorizontal.value ? '100%' : isVisible.value ? `${containerSize.width}px` : '0px',
		transition: isVisible.value
			? `width ${props.duration}ms ease-in ${props.delay}ms, height ${props.duration}ms ease-in ${props.delay}ms`
			: undefined,
	}
})

const panPercentage = 3
const imageStyle = computed(() => {
	/**
	 * Pan image to direction prop when in view
	 * When visible, set transfromX/Y to 0
	 * Otherwise, set to +/- panPercentage% inverse to direction.
	 */
	return {
		height: isHorizontal.value ? '100%' : `${containerSize.height}px`,
		width: isHorizontal.value ? `${containerSize.width}px` : '100%',
		transition: isVisible.value
			? `transform ${props.duration}ms ease-in ${props.delay}ms`
			: undefined,
		transform: isVisible.value
			? 'translate(0, 0)'
			: props.direction === 'right'
				? `translate(-${panPercentage}%, 0)`
				: props.direction === 'left'
					? `translate(${panPercentage}%, 0)`
					: props.direction === 'down'
						? `translate(0, -${panPercentage}%)`
						: `translate(0, ${panPercentage}%)`,
	}
})
</script>

<template>
	<div ref="container">
		<div :style="wrapperStyle">
			<NuxtImg v-bind="props" :style="imageStyle" class="block object-cover object-center" />
		</div>
	</div>
</template>
