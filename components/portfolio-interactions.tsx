'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

function cubicBezierEase(progress: number) {
  let parameter = progress
  let lowerBound = 0
  let upperBound = 1

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const inverse = 1 - parameter
    const x = 3 * inverse * inverse * parameter * 0.22 + 3 * inverse * parameter * parameter * 0.36 + parameter ** 3
    const error = x - progress
    if (Math.abs(error) < 0.001) break

    if (error < 0) lowerBound = parameter
    else upperBound = parameter

    const derivative = 3 * inverse * inverse * 0.22 + 6 * inverse * parameter * (0.36 - 0.22) + 3 * parameter * parameter * (1 - 0.36)
    const candidate = derivative > 0 ? parameter - error / derivative : Number.NaN
    parameter = candidate > lowerBound && candidate < upperBound ? candidate : (lowerBound + upperBound) / 2
  }

  const inverse = 1 - parameter
  return 3 * inverse * inverse * parameter + 3 * inverse * parameter * parameter + parameter ** 3
}

export function PortfolioInteractions() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [loaderState, setLoaderState] = useState<'loading' | 'complete' | 'hidden'>('loading')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLoaderState('hidden')
      return
    }

    let value = 0
    let exitTimer = 0
    const counter = window.setInterval(() => {
      value = Math.min(value + 4, 100)
      setProgress(value)

      if (value === 100) {
        window.clearInterval(counter)
        setLoaderState('complete')
        exitTimer = window.setTimeout(() => setLoaderState('hidden'), 460)
      }
    }, 28)

    return () => {
      window.clearInterval(counter)
      window.clearTimeout(exitTimer)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    let lenis: Lenis | null = null
    let lenisTick: ((time: number) => void) | null = null
    let updateScroll: (() => void) | null = null

    if (!isCoarsePointer) {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
      })
      updateScroll = () => ScrollTrigger.update()
      lenis.on('scroll', updateScroll)
      lenisTick = (time) => lenis?.raf(time * 1000)
      gsap.ticker.add(lenisTick)
      gsap.ticker.lagSmoothing(0)
    }

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-headline]').forEach((heading) => {
        const words = gsap.utils.toArray<HTMLElement>('[data-headline-word]', heading)
        if (!words.length) return

        gsap.fromTo(
          words,
          { yPercent: 112, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.82,
            delay: heading.classList.contains('hero-title') ? 0.12 : 0,
            stagger: 0.075,
            ease: cubicBezierEase,
            scrollTrigger: heading.classList.contains('hero-title')
              ? undefined
              : {
                  trigger: heading,
                  start: 'top 88%',
                  once: true,
                },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-portrait-frame]').forEach((frame) => {
        const image = frame.querySelector<HTMLImageElement>('[data-portrait-image]')
        if (!image) return

        const isHero = frame.dataset.portraitHero === 'true'
        if (isHero) {
          gsap.fromTo(
            frame,
            { clipPath: 'inset(100% 0 0 0)' },
            {
              clipPath: 'inset(0 0 0 0)',
              duration: 1.2,
              delay: 0.28,
              ease: cubicBezierEase,
            },
          )

          if (window.innerWidth >= 768) {
            gsap.to(image, {
              y: 24,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            })
          }
        }
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 26, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: cubicBezierEase,
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })

      const curve = document.querySelector<SVGPathElement>('[data-curve-line]')
      if (curve) {
        const length = curve.getTotalLength()
        gsap.set(curve, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(curve, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '#about',
            start: 'top 82%',
            end: 'top 34%',
            scrub: true,
          },
        })
      }

      const contactPanel = document.querySelector<HTMLElement>('.contact-section')
      if (contactPanel) {
        gsap.fromTo(
          contactPanel,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0 0 0 0)',
            duration: 1.05,
            ease: cubicBezierEase,
            scrollTrigger: {
              trigger: contactPanel,
              start: 'top 85%',
              once: true,
            },
          },
        )
      }

      const timelineLine = document.querySelector<HTMLElement>('[data-journey-line]')
      const timelineDot = document.querySelector<HTMLElement>('[data-journey-dot]')
      if (timelineLine && timelineDot) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: '#journey',
            start: 'top 78%',
            once: true,
          },
        })
        timeline.fromTo(timelineLine, { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: cubicBezierEase })
        timeline.fromTo(timelineDot, { scale: 0.35, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: cubicBezierEase }, '-=0.18')
        timeline.to(timelineDot, { scale: 1.45, duration: 0.22, ease: cubicBezierEase }, '+=0.08')
        timeline.to(timelineDot, { scale: 1, duration: 0.3, ease: cubicBezierEase })
      }
    }, document.body)

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      context.revert()
      if (lenis && updateScroll) lenis.off('scroll', updateScroll)
      if (lenisTick) gsap.ticker.remove(lenisTick)
      lenis?.destroy()
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return
    const activeCursor = cursor

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    if (prefersReducedMotion || isCoarsePointer) return

    document.documentElement.classList.add('has-custom-cursor')
    let frame = 0

    function handlePointerMove(event: PointerEvent) {
      const isInteractive =
        event.target instanceof Element &&
        Boolean(event.target.closest('a, button, [data-cursor="interactive"]'))
      activeCursor.dataset.visible = 'true'
      activeCursor.dataset.active = String(isInteractive)

      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        activeCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      })
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 768
    ) {
      return
    }

    const magneticTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const listeners = magneticTargets.map((target) => {
      const handlePointerMove = (event: PointerEvent) => {
        const bounds = target.getBoundingClientRect()
        const offsetX = Math.max(-8, Math.min(8, ((event.clientX - bounds.left) / bounds.width - 0.5) * 16))
        const offsetY = Math.max(-8, Math.min(8, ((event.clientY - bounds.top) / bounds.height - 0.5) * 16))
        gsap.to(target, {
          x: offsetX,
          y: offsetY,
          duration: 0.38,
          ease: cubicBezierEase,
          overwrite: true,
        })
      }
      const reset = () => {
        gsap.to(target, { x: 0, y: 0, duration: 0.55, ease: cubicBezierEase })
      }

      target.addEventListener('pointermove', handlePointerMove)
      target.addEventListener('pointerleave', reset)
      return () => {
        target.removeEventListener('pointermove', handlePointerMove)
        target.removeEventListener('pointerleave', reset)
        gsap.killTweensOf(target)
        gsap.set(target, { clearProps: 'transform' })
      }
    })

    return () => listeners.forEach((removeListeners) => removeListeners())
  }, [])

  return (
    <>
      {loaderState !== 'hidden' && (
        <div className="intro-loader" aria-hidden="true" data-complete={loaderState === 'complete'}>
          <div className="intro-loader-top">
            <span>A / A</span>
            <span>Dhaka · Bangladesh</span>
          </div>
          <div className="intro-loader-count">
            <span>{String(progress).padStart(3, '0')}</span>
            <span>/ 100</span>
          </div>
          <div>
            <div className="intro-loader-bottom">
              <span>Reading the signal</span>
              <span>Statistics × Systems × Image</span>
            </div>
            <div className="intro-loader-track">
              <span className="intro-loader-progress" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
      <div ref={cursorRef} className="portfolio-cursor" aria-hidden="true" />
    </>
  )
}
