<script lang="ts" setup>
import type { Project } from '~~/shared/types/project'

const route = useRoute()

const { data, error, status } = await useFetch<Project>(`/api/projects/${route.params.slug}`)
</script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">Project: {{ route.params.slug }}</h1>
		<pre>{{ data }}</pre>
		<pre>{{ error }}</pre>
		<pre>Status: {{ status }}</pre>
	</UContainer>
</template>
