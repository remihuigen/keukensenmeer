<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { BlobObject, BlobType } from '@nuxthub/core/blob'

import { UseClipboard } from '@vueuse/components'
import { useClipboard } from '@vueuse/core'
import {
	ACCEPTED_IMAGE_TYPES,
	formatBytes,
	MAX_DIMENSIONS,
	MAX_FILE_SIZE,
	MIN_DIMENSIONS,
} from '~~/shared/utils/blob'
import { z } from 'zod'

definePageMeta({
	layout: 'default',
	title: 'Upload afbeeldingen en bestanden',
	description: 'Upload afbeeldingen en bestanden naar opslag.',
})

const schema = z.object({
	image: z
		.instanceof(File, {
			message: 'Kies een afbeelding...',
		})
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: `De afbeelding is te groot. Kies een afbeelding kleiner dan ${formatBytes(MAX_FILE_SIZE)}.`,
		})
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as BlobType), {
			message: `Kies een geldig afbeeldingstype (${ACCEPTED_IMAGE_TYPES.map((type) => type.split('/')[0])}).`,
		})
		.refine(
			(file) =>
				new Promise((resolve) => {
					const reader = new FileReader()
					reader.onload = (e) => {
						const img = new Image()
						img.onload = () => {
							const meetsDimensions =
								img.width >= MIN_DIMENSIONS.width &&
								img.height >= MIN_DIMENSIONS.height &&
								img.width <= MAX_DIMENSIONS.width &&
								img.height <= MAX_DIMENSIONS.height
							resolve(meetsDimensions)
						}
						img.src = e.target?.result as string
					}
					reader.readAsDataURL(file)
				}),
			{
				message: `Het formaat van de afbeelding is ongeldig. Kies een grootte tussen ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} en ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`,
			},
		),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
	image: undefined,
})

const toast = useToast()

const loading = ref(false)
const currentBlobId = ref<BlobObject['pathname']>('')
const blobHistory = ref<BlobObject[]>([])

const upload = useUpload('/api/blob', {
	method: 'PUT',
	headers: { Authorization: `Bearer ${useRuntimeConfig().public.apiToken}` },
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true
	try {
		const uploadedFile = await upload(event.data.image)
		blobHistory.value.push(uploadedFile)
		currentBlobId.value = uploadedFile.pathname
		const { copy } = useClipboard({ source: uploadedFile.pathname })
		toast.add({
			color: 'success',
			title: 'Upload geslaagd',
			description:
				'Je afbeelding is succesvol geüpload. Zorg ervoor je de afbeelding ID kopieert.',
			actions: [
				{
					icon: 'lucide:copy',
					label: 'Kopieer ID',
					onClick: () => {
						copy()
						toast.add({
							color: 'info',
							title: 'Gekopieerd',
							description: 'Het afbeelding ID is naar je klembord gekopieerd.',
						})
					},
				},
			],
		})
		state.image = undefined
	} catch (err) {
		console.error('Upload failed:', err)
		toast.add({
			color: 'error',
			title: 'Upload mislukt',
			description:
				'Er is een fout opgetreden tijdens het uploaden. Probeer het later opnieuw.',
		})
	} finally {
		loading.value = false
	}
}

const { isDev } = useRuntimeConfig().public.mode
</script>

<template>
	<Section>
		<UContainer class="space-y-12">
			<h1
				class="text-shadow-secondary-800 font-serif text-5xl font-bold text-white text-shadow-lg/30"
			>
				Upload een
				<Hand>afbeelding</Hand>
			</h1>
			<UForm :schema="schema" :state="state" class="w-96 space-y-4" @submit="onSubmit">
				<UFormField
					name="image"
					label="Afbeelding uploaden"
					description="JPG, WEBP of PNG. 5MB Max."
				>
					<UFileUpload
						v-model="state.image"
						accept="image/*"
						icon="i-lucide-image"
						label="Sleep je afbeelding hier in"
						description="PNG, JPG of WebP (max. 5MB)"
						class="min-h-60 w-full"
						highlight
						:ui="{
							base: 'bg-secondary-600',
						}"
					/>
				</UFormField>
				<UButton :loading="loading" type="submit" label="Uploaden" color="neutral" block />
			</UForm>
			<div
				v-if="!!blobHistory.length"
				class="bg-secondary-600 mt-8 space-y-6 rounded-lg p-4 py-6"
			>
				<h2 class="color=primary font-bold">Recent geüpload</h2>
				<ul class="space-y-3">
					<li
						v-for="blob in blobHistory"
						:key="blob.pathname"
						class="flex items-center gap-6"
					>
						<NuxtImg
							:src="isDev ? `/images/${blob.pathname}` : getImagePath(blob.pathname)"
							class="size-16 rounded-full"
							width="80"
							height="80"
							:provider="isDev ? 'none' : 'cloudflare'"
						/>
						<div class="flex items-center gap-3">
							<span>{{ blob.pathname }}</span>
							<UseClipboard v-slot="{ copy, copied }" :source="blob.pathname">
								<UButton
									size="xs"
									variant="ghost"
									:icon="copied ? 'lucide:check' : 'lucide:copy'"
									@click="copy()"
								/>
							</UseClipboard>
						</div>
					</li>
				</ul>

				<UAlert
					color="neutral"
					icon="lucide:info"
					description="Let op: zodra je de pagina verlaat is deze lijst van uploads verdwenen. Zorg dat je de ID's kopieert vóórdat je de pagina verlaat!"
					variant="subtle"
				/>
			</div>
		</UContainer>
	</Section>
</template>
