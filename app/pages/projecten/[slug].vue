<script lang="ts" setup>
const route = useRoute()
</script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">Project: {{ route.params.slug }}</h1>
	</UContainer>
</template>
