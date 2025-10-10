<script lang="ts" setup>
const { isProd } = useRuntimeConfig().public.mode
if (isProd) {
	throw createError({
		statusCode: 404,
		message: 'Pagina niet gevonden',
		fatal: import.meta.client,
	})
}
</script>

<template>
	<UContainer>
		<h1>Dev</h1>
		<NuxtLink to="/">Home</NuxtLink>
	</UContainer>
</template>
