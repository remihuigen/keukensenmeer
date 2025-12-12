<script lang="ts" setup>
import { 
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_DIMENSIONS,
  MIN_DIMENSIONS,
  formatBytes
} from '~~/shared/utils/blob'

import { z } from 'zod'
import type { BlobType, BlobObject } from '@nuxthub/core'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { UseClipboard } from '@vueuse/components'

definePageMeta({
  layout: 'default',
  title: 'Upload afbeeldingen en bestanden',
  description: 'Upload afbeeldingen en bestanden naar opslag.',
})


const schema = z.object({
  image: z
    .instanceof(File, {
      message: 'Kies een afbeelding...'
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `De afbeelding is te groot. Kies een afbeelding kleiner dan ${formatBytes(MAX_FILE_SIZE)}.`
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as BlobType), {
      message: `Kies een geldig afbeeldingstype (${ACCEPTED_IMAGE_TYPES.map(type => type.split('/')[0])}).`
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
        message: `Het formaat van de afbeelding is ongeldig. Kies een grootte tussen ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} en ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`
      }
    )
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  image: undefined
})

const toast = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const currentBlobId = ref<BlobObject['pathname']>('')
const blobHistory = ref<BlobObject[]>([])

const { apiToken } = useRuntimeConfig().public
const upload = useUpload('/api/blob', { method: 'PUT', headers: { Authorization: `Bearer ${apiToken}` } })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const uploadedFile = await upload(event.data.image)
    error.value = null
    blobHistory.value.push(uploadedFile)
    currentBlobId.value = uploadedFile.pathname
    const { copy } = useClipboard({ source: uploadedFile.pathname })
    toast.add({
      color: 'success',
      title: 'Upload geslaagd',
      description: 'Je afbeelding is succesvol geüpload. Zorg ervoor je de afbeelding ID kopieert.',
      actions: [
        {
          icon: 'lucide:copy',
          label: 'Kopieer ID',
          onClick: () => {
            copy()
            toast.add({
              color: 'info',
              title: 'Gekopieerd',
              description: 'Het afbeelding ID is naar je klembord gekopieerd.'
            })
          }
        }
      ]
    })
  } catch (err) {
    console.error('Upload failed:', err)
    toast.add({
      color: 'error',
      title: 'Upload mislukt',
      description: 'Er is een fout opgetreden tijdens het uploaden. Probeer het later opnieuw.'
    })
  } finally {
    loading.value = false
    state.image = undefined
  }
}
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
     <UForm :schema="schema" :state="state" class="space-y-4 w-96" @submit="onSubmit">
      <UFormField name="image" label="Afbeelding uploaden" description="JPG, WEBP of PNG. 2MB Max.">
        <UFileUpload 
          v-model="state.image" 
          accept="image/*"
          icon="i-lucide-image"
          label="Sleep je afbeelding hier in"
          description="PNG, JPG of WebP (max. 2MB)"
          class="w-full min-h-60" 
          highlight
          :ui="{
            base: 'bg-secondary-600'
          }"
        />
      </UFormField>
      <UButton :loading="loading" type="submit" label="Uploaden" color="neutral" block />
    </UForm>
    <div v-if="!!blobHistory.length" class="mt-8 p-4 py-6 bg-secondary-600 rounded-lg space-y-6">
      <h2 class="font-bold color=primary">Recent geüpload</h2>
      <ul>
        <li 
          v-for="blob in blobHistory"
          :key="blob.pathname"
          class="flex gap-6 items-center"
        >
          <NuxtImg 
            :src="`/images/${blob.pathname}`"
            class="rounded-full size-16"
            width="80"
            height="80"
          />
          <div class="flex gap-3 items-center">
            <span>{{ blob.pathname }}</span>
            <UseClipboard 
              v-slot="{ copy, copied }" 
              :source="blob.pathname"
            >
              <UButton size="xs" variant="ghost" :icon="copied ? 'lucide:check' : 'lucide:copy'" @click="copy()" />
            </UseClipboard>
          </div>
        </li>
      </ul>

      <UAlert color="neutral" icon="lucide:info" description="Let op: zodra je de pagina verlaat is deze lijst van uploads verdwenen. Zorg dat je de ID's kopieert vóórdat je de pagina verlaat!" variant="subtle" />
    </div>
	</UContainer>
  </Section>
</template>