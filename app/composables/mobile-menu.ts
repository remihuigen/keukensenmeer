export const useMobileMenu = () => {
  const transitionDuration = 300
  const transitionDurationMs = `${transitionDuration}ms`
  const mobileMenuOpen = useState('mobileMenuOpen', () => false)
  const shiftLeft = ref(false)
  const shiftRight = ref(false)

  const isToggling = ref(false)
  /**
 * Toggle mobile menu with transition lock
 * Prevents rapid toggling during animation
 */
  const toggle = () => {
    // Prevent toggling if already in transition
    if (isToggling.value) return

    isToggling.value = true
    mobileMenuOpen.value = !mobileMenuOpen.value

    // Re-enable toggling after transition completes
    setTimeout(() => {
      isToggling.value = false
    }, transitionDuration)
  }


  watch(mobileMenuOpen, (newVal, oldVal) => {
    if (newVal === oldVal) return

    if (newVal) {
      shiftLeft.value = true
      shiftRight.value = false
      setTimeout(() => {
        shiftLeft.value = false
        shiftRight.value = true
      }, transitionDuration)
    } else {
      shiftLeft.value = false
      shiftRight.value = false
    }
  })

  /**
   * Lock/unlock page scroll based on mobile menu state
   * Prevents background scrolling when mobile menu is open
   */
  function lockPageScroll(isOpen: boolean) {
    if (import.meta.client) {
      if (isOpen) {
        // Lock scroll - store current scroll position
        const scrollY = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
      } else {
        // Unlock scroll - restore scroll position
        const scrollY = document.body.style.top
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''

        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1)
        }
      }
    }
  }

  /**
   * Cleanup scroll lock on component unmount
   * Ensures scroll is always restored if component is destroyed
   */
  function resetScrollLock() {
    if (import.meta.client) {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }

  return {
    mobileMenuOpen,
    shiftLeft,
    shiftRight,
    transitionDuration,
    transitionDurationMs,
    toggle,
    lockPageScroll,
    resetScrollLock
  }
}
