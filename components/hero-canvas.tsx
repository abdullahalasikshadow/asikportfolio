'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  t: number
  scatter: number
  phase: number
  size: number
}

function seededValue(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

const particles: Particle[] = Array.from({ length: 220 }, (_, index) => ({
  t: seededValue(index + 1) * 5.6 - 2.8,
  scatter: seededValue(index + 271) - 0.5,
  phase: seededValue(index + 541) * Math.PI * 2,
  size: 0.55 + seededValue(index + 811) * 1.35,
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const candidateHostElement = canvas?.parentElement
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !candidateHostElement || !context) return

    const activeCanvas = canvas as HTMLCanvasElement
    const activeHostElement = candidateHostElement as HTMLElement
    const drawingContext = context
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    let prefersReducedMotion = reducedMotionQuery.matches
    let isCoarsePointer = coarsePointerQuery.matches
    let isMobile = mobileQuery.matches
    let activeParticles = particles.slice(0, isMobile ? 90 : 220)
    let width = 0
    let height = 0
    let frame = 0
    let isVisible = false
    let pointerX = -1000
    let pointerY = -1000
    const animationStartedAt = performance.now()

    function draw(now = performance.now()) {
      drawingContext.clearRect(0, 0, width, height)
      if (!width || !height) return

      const gridStep = Math.max(40, Math.min(78, width / 11))
      drawingContext.lineWidth = 1
      drawingContext.strokeStyle = 'rgba(226, 234, 201, 0.055)'
      drawingContext.beginPath()
      for (let x = gridStep; x < width; x += gridStep) {
        drawingContext.moveTo(x, 0)
        drawingContext.lineTo(x, height)
      }
      for (let y = gridStep; y < height; y += gridStep) {
        drawingContext.moveTo(0, y)
        drawingContext.lineTo(width, y)
      }
      drawingContext.stroke()

      const centerX = width * 0.72
      const baseline = height * 0.78
      const sigma = Math.max(40, width * (isCoarsePointer ? 0.2 : 0.155))
      const amplitude = height * (isCoarsePointer ? 0.34 : 0.47)
      const settle = prefersReducedMotion ? 1 : clamp((now - animationStartedAt) / 2500, 0, 1)
      const scatterScale = height * (0.24 * (1 - settle) + 0.012 * settle)

      drawingContext.beginPath()
      for (let step = 0; step <= 120; step += 1) {
        const t = -3 + (step / 120) * 6
        const x = centerX + t * sigma
        const y = baseline - amplitude * Math.exp(-0.5 * t * t)
        if (step === 0) drawingContext.moveTo(x, y)
        else drawingContext.lineTo(x, y)
      }
      const curveOpacity = Math.min(0.96, (0.2 + settle * 0.42) * 2.5)
      drawingContext.strokeStyle = `rgba(215, 247, 109, ${curveOpacity})`
      drawingContext.lineWidth = 1.5
      drawingContext.stroke()

      drawingContext.save()
      drawingContext.globalAlpha = settle * 0.42
      drawingContext.beginPath()
      drawingContext.moveTo(width * 0.15, height * 0.68)
      drawingContext.lineTo(width * 0.96, height * 0.58)
      drawingContext.strokeStyle = 'rgba(240, 240, 231, 0.7)'
      drawingContext.lineWidth = 1
      drawingContext.stroke()
      drawingContext.restore()

      activeParticles.forEach((particle, index) => {
        const bell = Math.exp(-0.5 * particle.t * particle.t)
        const curveY = baseline - amplitude * bell
        let x = centerX + particle.t * sigma
        let y = curveY + particle.scatter * scatterScale
        y += Math.sin(particle.phase + now * 0.00035) * (prefersReducedMotion ? 0 : 1.8)

        if (!isCoarsePointer && pointerX >= 0 && pointerY >= 0) {
          const dx = x - pointerX
          const dy = y - pointerY
          const distance = Math.hypot(dx, dy)
          const influence = Math.max(0, 1 - distance / 150) * 11
          if (distance > 0 && influence > 0) {
            x += (dx / distance) * influence
            y += (dy / distance) * influence
          }
        }

        if (x < -4 || x > width + 4) return

        const proximity = 1 - clamp(Math.abs(y - curveY) / Math.max(height * 0.16, 1), 0, 1)
        const opacity = 0.12 + bell * 0.16 + proximity * 0.64
        drawingContext.beginPath()
        drawingContext.arc(x, y, particle.size, 0, Math.PI * 2)
        drawingContext.fillStyle = index % 5 === 0 || proximity > 0.76
          ? `rgba(215, 247, 109, ${opacity})`
          : `rgba(240, 240, 231, ${opacity * 0.58})`
        drawingContext.fill()
      })
    }

    function animate(now: number) {
      if (!isVisible || prefersReducedMotion) return
      draw(now)
      frame = window.requestAnimationFrame(animate)
    }

    function setVisibility(visible: boolean) {
      isVisible = visible
      window.cancelAnimationFrame(frame)
      if (visible) {
        draw()
        if (!prefersReducedMotion) frame = window.requestAnimationFrame(animate)
      }
    }

    function resize() {
      const rect = activeHostElement.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      isMobile = mobileQuery.matches
      activeParticles = particles.slice(0, isMobile ? 90 : 220)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      activeCanvas.width = Math.round(width * pixelRatio)
      activeCanvas.height = Math.round(height * pixelRatio)
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      draw()
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = activeHostElement.getBoundingClientRect()
      pointerX = event.clientX - rect.left
      pointerY = event.clientY - rect.top
    }

    function handlePointerLeave() {
      pointerX = -1000
      pointerY = -1000
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      prefersReducedMotion = event.matches
      setVisibility(isVisible)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(activeHostElement)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setVisibility(Boolean(entry?.isIntersecting))
    })
    visibilityObserver.observe(activeHostElement)

    if (!isCoarsePointer) {
      activeHostElement.addEventListener('pointermove', handlePointerMove, { passive: true })
      activeHostElement.addEventListener('pointerleave', handlePointerLeave)
    }

    reducedMotionQuery.addEventListener('change', handleMotionChange)
    resize()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      reducedMotionQuery.removeEventListener('change', handleMotionChange)
      activeHostElement.removeEventListener('pointermove', handlePointerMove)
      activeHostElement.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}
