import { ref } from 'vue'

export function useCounter(target: number, duration = 1200) {
  const count = ref(0)
  const isAnimating = ref(false)

  const animate = () => {
    if (isAnimating.value) return
    isAnimating.value = true

    const startTime = Date.now()
    const startValue = count.value

    const update = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutQuart easing function
      const eased = 1 - Math.pow(1 - progress, 4)

      count.value = Math.floor(startValue + (target - startValue) * eased)

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        count.value = target
        isAnimating.value = false
      }
    }

    requestAnimationFrame(update)
  }

  return {
    count,
    animate,
  }
}

