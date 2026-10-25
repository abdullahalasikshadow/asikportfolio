'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const LabInstruments = dynamic(() => import('./lab-instruments'), {
  ssr: false,
  loading: () => <div className="lab-instrument-loading" aria-hidden="true" />,
})

export function LabSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      setIsVisible(true)
      return
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true)
          loadObserver.disconnect()
        }
      },
      { rootMargin: '700px 0px', threshold: 0 },
    )
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setIsVisible(Boolean(entry?.isIntersecting))
    })

    loadObserver.observe(section)
    visibilityObserver.observe(section)

    return () => {
      loadObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="content-section lab-section"
      id="lab"
      aria-labelledby="lab-title"
    >
      <div className="section-label" data-reveal>
        <span>03 / Lab</span>
      </div>

      <div className="lab-content">
        <div className="lab-intro">
          <h2 className="section-title lab-title" id="lab-title" data-headline>
            <span className="display-line">
              <span className="display-word" data-headline-word>Touch</span>{' '}
              <span className="display-word" data-headline-word>the</span>
            </span>
            <span className="display-line">
              <span className="display-word" data-headline-word><em>data.</em></span>
            </span>
          </h2>
          <p className="lab-subline" data-reveal>
            Two small instruments. Everything runs live in your browser.
          </p>
        </div>

        <div className="lab-instrument-loader" aria-busy={!shouldLoad}>
          {shouldLoad ? (
            <LabInstruments active={isVisible} />
          ) : (
            <div className="lab-instrument-loading" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  )
}
