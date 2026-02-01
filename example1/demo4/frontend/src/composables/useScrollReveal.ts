import { onMounted, onUnmounted, ref } from 'vue'

export function useScrollReveal() {
  const isVisible = ref(false)
  const elementRef = ref<HTMLElement | null>(null)

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
      }
    })
  }

  const observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  })

  onMounted(() => {
    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      observer.unobserve(elementRef.value)
    }
    observer.disconnect()
  })

  return {
    isVisible,
    elementRef,
  }
}

