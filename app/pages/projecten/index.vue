<script lang="ts" setup>
const { data, error, status } = await useFetch(`/api/projects`)
</script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">
			Onze
			<Hand> projecten </Hand>
		</h1>
		<pre>{{ data }}</pre>
		<pre>{{ error }}</pre>
		<pre>Status: {{ status }}</pre>
	</UContainer>
</template>
