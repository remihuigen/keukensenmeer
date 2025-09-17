<script lang="ts" setup>


const { data } = await useAsyncData('my-data', async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Hello from async data!' })
    }, 1000)
  })
)
</script>

<template>
  <NuxtLayout>
    <h1>My other page</h1>
    <p>This is the content of the other page.</p>
    <pre>{{ data }}</pre>
    <UButton to="/" label="index page" />
  </NuxtLayout>
</template>