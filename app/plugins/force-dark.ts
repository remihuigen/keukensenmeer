export default defineNuxtPlugin((nuxtApp) => {
    const colorMode = useColorMode()
    colorMode.preference = 'dark'
})
