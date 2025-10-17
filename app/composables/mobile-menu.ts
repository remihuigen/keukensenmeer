export const useMobileMenu = () => {
  const transitionDuration = 300
  const transitionDurationMs = transitionDuration + 'ms'
  const mobileMenuOpen = useState('mobileMenuOpen', () => false)
  const menuClosing = useState('menuClosing', () => false)

  /**
   * Toggle mobile menu open/close state
   */
  const toggle = () => {
    if (mobileMenuOpen.value) {
      // closing: set closing flag to reverse content animation
      menuClosing.value = true
      mobileMenuOpen.value = false
      setTimeout(() => {
        menuClosing.value = false
        // isToggling.value = false
      }, transitionDuration)
    } else {
      // opening
      mobileMenuOpen.value = true
    }
  }

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

  /**
   * We do not want to set lifecycle hooks and wacthers directly in the composable,
   * since that will register them each them a composable is invoked.
   * So we provide a utility function to set them in the consuming component.
   */
  function setHooks() {
    watch(mobileMenuOpen, lockPageScroll, { immediate: false })
    onUnmounted(resetScrollLock)
  }

  return {
    mobileMenuOpen,
    menuClosing,
    transitionDuration,
    transitionDurationMs,
    toggle,
    lockPageScroll,
    resetScrollLock,
    setHooks
  }
}
