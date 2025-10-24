<script lang="ts" setup>
import type { Project } from '~~/shared/types/project'

const route = useRoute()

const { data, error, status } = await useFetch<Project>(`/api/projects/${route.params.slug}`)

if (!data.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Project niet gevonden',
		fatal: import.meta.client,
	})
}

useSeoMeta({
	title: data.value.title,
	description: data.value.description,
	ogDescription: data.value.description,
	twitterTitle: data.value.title,
	twitterDescription: data.value.description,
	ogImage: data.value.mainImage,
	twitterImage: data.value.mainImage,
})

useSchemaOrg([
	defineWebPage({
		'@type': 'ItemPage',
	}),
])
</script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">Project: {{ route.params.slug }}</h1>
		<pre>{{ data }}</pre>
		<pre>{{ error }}</pre>
		<pre>Status: {{ status }}</pre>
	</UContainer>
</template>
