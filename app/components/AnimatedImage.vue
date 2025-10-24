<script lang="ts" setup>
import { useElementVisibility } from '@vueuse/core'

/**
 * Animation direction type for reveal and pan effects.
 */
type AnimationDirection = 'up' | 'down' | 'left' | 'right'

/**
 * Animation control configuration.
 */
interface AnimationConfig {
	/**
	 * Direction of the reveal animation.
	 * Controls whether width or height expands, and from which side.
	 * @default "right"
	 */
	direction?: AnimationDirection

	/**
	 * Duration of the expand animation, in milliseconds.
	 * @default 800
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
	 * @default 0.3
	 */
	threshold?: number | number[]
}

/**
 * Pan effect configuration.
 */
interface PanConfig {
	/**
	 * Enables a panning effect on the image background property,
	 * separate from the reveal animation.
	 * @default false
	 */
	enabled?: boolean

	/**
	 * Direction of the pan effect. Defaults to the animation direction.
	 */
	direction?: AnimationDirection

	/**
	 * Duration of the pan effect, in milliseconds.
	 * @default 12000
	 */
	duration?: number

	/**
	 * The total drift percentage of the object position (0–50).
	 * Controls both visible movement and overscan.
	 * @default 10
	 */
	drift?: number

	/**
	 * Disables the subtle initial pan effect on reveal.
	 * Is only relevant if `enabled` is false.
	 * @default false
	 */
	disableInitial?: boolean
}

/**
 * Image configuration props.
 */
interface ImageConfig {
	/** Image source URL */
	src: string
	/** Alt text for accessibility */
	alt?: string
	/** Nuxt image responsive sizes */
	sizes?: string
	/** Explicit width in pixels */
	width?: number
	/** Explicit height in pixels */
	height?: number
	/** Nuxt image modifiers */
	modifiers?: Record<string, unknown>
	/** Image loading strategy */
	loading?: 'lazy' | 'eager'
	/** Image quality percentage */
	quality?: number
}

/**
 * Component props combining all configuration interfaces.
 */
interface Props extends AnimationConfig, ImageConfig {
	/** Pan effect configuration */
	pan?: PanConfig | boolean
}

const props = withDefaults(defineProps<Props>(), {
	direction: 'right',
	duration: 800,
	delay: 0,
	once: true,
	rootMargin: '-10% 0px -10% 0px',
	threshold: 0.3,
	pan: false,
})

/**
 * Normalize pan configuration from prop input.
 */
const panConfig = computed((): PanConfig => {
	if (typeof props.pan === 'boolean') {
		return {
			enabled: props.pan,
			duration: 12000,
			drift: 10,
			disableInitial: false,
		}
	}

	return {
		enabled: true,
		duration: 12000,
		drift: 10,
		disableInitial: false,
		...props.pan,
	}
})

/**
 * Check if animation direction is horizontal.
 */
const isHorizontalDirection = computed(
	(): boolean => props.direction === 'left' || props.direction === 'right',
)

/**
 * Get the effective pan direction.
 */
const effectivePanDirection = computed(
	(): AnimationDirection => panConfig.value.direction || props.direction,
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
 * Debounced ref to track if image is fully retracted.
 * Prevents animation jank during hide transition.
 */
const isNotRetracted = debouncedRef(isVisible, props.duration + props.delay)

/**
 * Update visibility state with once-only logic.
 */
watch(elementIsVisible, (newValue: boolean) => {
	if (isVisible.value && props.once) {
		return // Already visible and only once, do nothing
	}
	isVisible.value = newValue
})

/**
 * Generate clip path for reveal animation.
 */
const getClipPath = (direction: AnimationDirection, isVisible: boolean): string => {
	if (isVisible) {
		return 'inset(0 0 0 0)'
	}

	const clipPaths: Record<AnimationDirection, string> = {
		right: 'inset(0 100% 0 0)',
		left: 'inset(0 0 0 100%)',
		up: 'inset(100% 0 0 0)',
		down: 'inset(0 0 100% 0)',
	}

	return clipPaths[direction]
}

/**
 * Computed style for the clip container.
 */
const clipperStyle = computed(() => ({
	clipPath: getClipPath(props.direction, isVisible.value),
	transition: `clip-path ${props.duration}ms cubic-bezier(0.65, 0.05, 0.36, 1) ${props.delay}ms`,
}))

/**
 * Generate keyframe name for pan animation.
 */
const getPanKeyframes = (direction: AnimationDirection, isInitial: boolean): string => {
	const prefix = isInitial ? 'initial-' : ''
	return `${prefix}pan-${direction}`
}

/**
 * Computed style for the image with pan effects.
 */
const imageStyle = computed(() => {
	const config = panConfig.value

	// No pan effects applied
	if (!config.enabled && config.disableInitial) {
		return {}
	}

	const isInitialOnly = !config.enabled
	const timing = isInitialOnly ? 'cubic-bezier(0.65, 0.05, 0.36, 1)' : 'linear'
	const repeat = isInitialOnly ? '1 both' : 'infinite alternate'
	const duration = isInitialOnly ? props.duration : config.duration
	const keyframes = getPanKeyframes(effectivePanDirection.value, isInitialOnly)

	// Continue pan during retraction to avoid visual jank
	const shouldAnimate = isVisible.value || isNotRetracted.value

	if (!shouldAnimate) {
		return {}
	}

	const driftAmount = config.drift || 0

	return {
		'--pan-drift': `${driftAmount}%`,
		animation: `${keyframes} ${duration}ms ${timing} ${props.delay}ms ${repeat}`,
		width: `${100 + (isHorizontalDirection.value ? driftAmount : 0)}%`,
		height: `${100 + (!isHorizontalDirection.value ? driftAmount : 0)}%`,
		maxWidth: 'none',
		maxHeight: 'none',
		willChange: 'transform',
	}
})

/**
 * Extract image-specific props for NuxtImg component.
 */
const imageProps = computed(() => {
	const { src, alt, sizes, width, height, modifiers, loading, quality } = props

	return {
		src,
		alt,
		sizes,
		width,
		height,
		modifiers,
		loading,
		quality,
	}
})
</script>

<template>
	<div ref="container" class="animated-image relative">
		<div :style="clipperStyle" class="absolute inset-0 h-full w-full overflow-hidden">
			<NuxtImg
				v-bind="imageProps"
				class="absolute inset-0 block h-full w-full object-cover object-center"
				:style="imageStyle"
			/>
		</div>
	</div>
</template>

<style lang="postcss">
/* Continuous pan animations */
@keyframes pan-left {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(calc(-1 * var(--pan-drift)));
	}
}

@keyframes pan-right {
	from {
		transform: translateX(calc(-1 * var(--pan-drift)));
	}
	to {
		transform: translateX(0);
	}
}

@keyframes pan-up {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(calc(-1 * var(--pan-drift)));
	}
}

@keyframes pan-down {
	from {
		transform: translateY(calc(-1 * var(--pan-drift)));
	}
	to {
		transform: translateY(0);
	}
}

/* Initial reveal pan animations */
@keyframes initial-pan-left {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(-2%);
	}
}

@keyframes initial-pan-right {
	from {
		transform: translateX(-2%);
	}
	to {
		transform: translateX(0);
	}
}

@keyframes initial-pan-up {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(-2%);
	}
}

@keyframes initial-pan-down {
	from {
		transform: translateY(-2%);
	}
	to {
		transform: translateY(0);
	}
}
</style>
