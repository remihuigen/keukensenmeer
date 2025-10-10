<script lang="ts" setup>
defineProps<{
	noMargin?: boolean
}>()
</script>

<template>
	<span
		class="font-hand text-primary-500 leading-[0] whitespace-nowrap"
		:style="{
			fontSize: '2em',
			marginLeft: !!noMargin ? '0' : '0.25em',
			marginRight: !!noMargin ? '0' : '0.25em',
		}"
	>
		<slot />
	</span>
</template>
