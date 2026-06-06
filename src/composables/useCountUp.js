import { ref, onUnmounted } from 'vue'

export function useCountUp(target, duration = 1800) {
  const count = ref(0)
  let observer = null
  let started = false

  const start = () => {
    if (started) return
    started = true

    const startTime = performance.now()
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      count.value = Math.round(target * easeOut(progress))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }

  const elRef = (el) => {
    observer?.disconnect()
    if (!el) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
  }

  onUnmounted(() => observer?.disconnect())

  return { count, elRef }
}
