export const useMobileMenu = () => {
  // This constant should match the --menu-transition-duration variable in the main.css file
  const transitionDuration = 300
  const mobileMenuOpen = useState('mobileMenuOpen', () => false)
  const menuClosing = useState('menuClosing', () => false)
  const routeChange = useState('routeChange', () => false)

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
        // Twice the transition duration to ensure all animations are complete
        // Being the fade out of menu, and slide in of page content
      }, transitionDuration * 2)
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


  /** Navigation logic for route changes */
  const route = useRoute()

  function onRouteChange() {
    if (mobileMenuOpen.value) {
      // closing: set route change flag to prevent content animation
      // and let the page transition handle it
      routeChange.value = true
      setTimeout(() => {
        routeChange.value = false
        // Twice the transition duration to ensure all animations are complete
        // Being the fade out of menu, and slide in of page content
      }, transitionDuration * 2)
    }
    mobileMenuOpen.value = false
  }

  /**
   * We do not want to set lifecycle hooks and wacthers directly in the composable,
   * since that will register them each them a composable is invoked.
   * So we provide a utility function to set them in the consuming component,
   * where the utility is only called once
   */
  function setHooks() {
    watch(mobileMenuOpen, lockPageScroll, { immediate: false })
    onUnmounted(resetScrollLock)

    watch(
      () => route.path,
      onRouteChange
    )
  }

  /**
   * Computed classes for content wrapper
   * Applies the appropriate classes based on menu state
   * to handle animations and transitions
   */
  const contentTransitionClasses = computed(() => {
    return {
      'content': true,
      'menu-open': mobileMenuOpen.value,
      'menu-closing': menuClosing.value,
      'route-change': routeChange.value
    }
  })

  return {
    mobileMenuOpen,
    menuClosing,
    routeChange,
    transitionDuration,
    contentTransitionClasses,
    toggle,
    lockPageScroll,
    resetScrollLock,
    setHooks
  }
}
