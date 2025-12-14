<script lang="ts" setup>
const { data, error, status } = await useFetch(`/api/projects`)
</script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">
			Onze
			<Hand> projecten </Hand>
		</h1>

		<UPageGrid v-if="data">
			<UPageCard
				v-for="project in data.data"
				:key="project.id"
				:title="project.publicTitle"
				:description="project.description"
				:to="`/projecten/${project.slug}`"
			/>
		</UPageGrid>
		<pre>{{ data }}</pre>
		<pre>{{ error }}</pre>
		<pre>Status: {{ status }}</pre>
	</UContainer>
</template>
