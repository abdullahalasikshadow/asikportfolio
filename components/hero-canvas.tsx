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

const particles: Particle[] = Array.from({ length: 270 }, (_, index) => ({
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
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    const drawingContext = context as CanvasRenderingContext2D
    const hostElement = parent as HTMLElement
    const canvasElement = canvas as HTMLCanvasElement
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    let width = 0
    let height = 0
    let frame = 0
    let pointerX = -1000
    let pointerY = -1000
    let scrollProgress = 0

    function draw() {
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
      const settle = clamp(scrollProgress, 0, 1)
      const scatterScale = height * (0.24 - settle * 0.17)

      drawingContext.beginPath()
      for (let step = 0; step <= 120; step += 1) {
        const t = -3 + (step / 120) * 6
        const x = centerX + t * sigma
        const y = baseline - amplitude * Math.exp(-0.5 * t * t)
        if (step === 0) drawingContext.moveTo(x, y)
        else drawingContext.lineTo(x, y)
      }
      drawingContext.strokeStyle = `rgba(215, 247, 109, ${0.2 + settle * 0.42})`
      drawingContext.lineWidth = 1.25
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

      particles.forEach((particle, index) => {
        const bell = Math.exp(-0.5 * particle.t * particle.t)
        let x = centerX + particle.t * sigma
        let y = baseline - amplitude * bell + particle.scatter * scatterScale
        y += Math.sin(particle.phase + performance.now() * 0.00035) * (prefersReducedMotion ? 0 : 1.8)

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

        const opacity = 0.18 + bell * 0.52
        drawingContext.beginPath()
        drawingContext.arc(x, y, particle.size, 0, Math.PI * 2)
        drawingContext.fillStyle = index % 5 === 0
          ? `rgba(215, 247, 109, ${opacity})`
          : `rgba(240, 240, 231, ${opacity * 0.58})`
        drawingContext.fill()
      })
    }

    function resize() {
      const rect = hostElement.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.2 : 1.5)
      canvasElement.width = Math.round(width * pixelRatio)
      canvasElement.height = Math.round(height * pixelRatio)
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      draw()
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = hostElement.getBoundingClientRect()
      pointerX = event.clientX - rect.left
      pointerY = event.clientY - rect.top
    }

    function handlePointerLeave() {
      pointerX = -1000
      pointerY = -1000
    }

    function handleScroll() {
      scrollProgress = clamp(window.scrollY / Math.max(height * 0.9, 1), 0, 1)
      if (prefersReducedMotion) draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(parent)
    window.addEventListener('scroll', handleScroll, { passive: true })

    if (!isCoarsePointer) {
      hostElement.addEventListener('pointermove', handlePointerMove, { passive: true })
      hostElement.addEventListener('pointerleave', handlePointerLeave)
    }

    resize()
    if (!prefersReducedMotion) {
      const animate = () => {
        draw()
        frame = window.requestAnimationFrame(animate)
      }
      frame = window.requestAnimationFrame(animate)
    }

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      hostElement.removeEventListener('pointermove', handlePointerMove)
      hostElement.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}
