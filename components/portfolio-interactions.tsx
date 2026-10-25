'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

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

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
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
      const heroWords = gsap.utils.toArray<HTMLElement>('[data-hero-word]')
      if (heroWords.length) {
        gsap.fromTo(
          heroWords,
          { yPercent: 112, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1.15,
            delay: 0.12,
            stagger: 0.13,
            ease: 'power4.out',
          },
        )
      }

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 26, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.82,
            ease: 'power2.out',
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

      if (!isCoarsePointer && window.innerWidth >= 1100) {
        const projectSection = document.querySelector<HTMLElement>('.project-section')
        const projectVisual = document.querySelector<HTMLElement>('[data-project-pin]')

        if (projectSection && projectVisual) {
          ScrollTrigger.create({
            trigger: projectSection,
            start: 'top top+=96',
            end: '+=360',
            pin: projectVisual,
            pinSpacing: true,
            anticipatePin: 1,
          })
        }
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
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
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
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return
    }

    const magneticTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const listeners = magneticTargets.map((target) => {
      const handlePointerMove = (event: PointerEvent) => {
        const bounds = target.getBoundingClientRect()
        const offsetX = (event.clientX - bounds.left - bounds.width / 2) * 0.12
        const offsetY = (event.clientY - bounds.top - bounds.height / 2) * 0.12
        gsap.to(target, {
          x: offsetX,
          y: offsetY,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: true,
        })
      }
      const reset = () => {
        gsap.to(target, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.55)' })
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
