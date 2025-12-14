<script lang="ts" setup>
const route = useRoute()

const { data, error, status } = await useFetch(`/api/projects/${route.params.slug}`)

if (!data.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Project niet gevonden',
		fatal: import.meta.client,
	})
}

const { data: project } = data.value

useSeoMeta({
	title: `Project - ${project.publicTitle}`,
	description: project.description,
	ogDescription: project.description,
	twitterTitle: `Project - ${project.publicTitle}`,
	twitterDescription: project.description,
	// ogImage: project.mainImage,
	// twitterImage: data.value.mainImage,
})

useSchemaOrg([
	defineWebPage({
		'@type': 'ItemPage',
	}),
])

const { isDev } = useRuntimeConfig().public.mode
</script>

<template>
	<UContainer class="space-y-8 py-8">
		<h1 class="font-serif text-4xl font-bold text-white">{{ project.publicTitle }}</h1>
		<p class="leading-loose">{{ project.description }}</p>
		<UPageColumns v-if="data">
			<NuxtImg
				v-for="image in project.images"
				:key="image.id"
				:src="isDev ? `/images/${image.pathname}` : getImagePath(image.pathname)"
				class="aspect-auto w-full"
				width="400"
				:provider="isDev ? 'none' : 'cloudflare'"
			/>
		</UPageColumns>
		<pre>{{ data }}</pre>
		<pre>{{ error }}</pre>
		<pre>Status: {{ status }}</pre>
	</UContainer>
</template>
