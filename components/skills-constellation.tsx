'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Logo } from '@/components/logo'

const disciplines = [
  {
    id: 'analysis',
    number: '01',
    name: 'Statistical analysis',
    description: 'The discipline at the center of my Statistics Honours studies.',
    x: 24,
    y: 27,
  },
  {
    id: 'engineering',
    number: '02',
    name: 'Full-stack engineering',
    description: 'Working across the interface and the system behind it.',
    x: 76,
    y: 37,
  },
  {
    id: 'design',
    number: '03',
    name: 'Cinematic design',
    description: 'A visual discipline shaped by framing, contrast, and time.',
    x: 48,
    y: 78,
  },
] as const

type DisciplineId = (typeof disciplines)[number]['id']

export function SkillsConstellation() {
  const [activeId, setActiveId] = useState<DisciplineId>(disciplines[0].id)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeDiscipline = disciplines.find((discipline) => discipline.id === activeId) ?? disciplines[0]

  function selectWithArrowKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const directions: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }
    const direction = directions[event.key]
    if (direction === undefined) return

    event.preventDefault()
    const nextIndex = (index + direction + disciplines.length) % disciplines.length
    const nextDiscipline = disciplines[nextIndex]
    setActiveId(nextDiscipline.id)
    nodeRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="skills-visual" data-reveal>
      <div className="skills-map" role="group" aria-label="Select a practice area">
        <span className="skill-map-axis" aria-hidden="true" />
        <svg className="skill-map-connection" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="50" y1="50" x2={activeDiscipline.x} y2={activeDiscipline.y} />
        </svg>
        <span className="skill-map-core" aria-hidden="true">
          <Logo height={28} />
        </span>
        {disciplines.map((discipline, index) => (
          <button
            className="skill-node"
            key={discipline.id}
            ref={(element) => {
              nodeRefs.current[index] = element
            }}
            type="button"
            style={{ left: `${discipline.x}%`, top: `${discipline.y}%` }}
            aria-pressed={activeId === discipline.id}
            onClick={() => setActiveId(discipline.id)}
            onKeyDown={(event) => selectWithArrowKey(event, index)}
          >
            <span className="skill-node-index">{discipline.number}</span>
            <span>{discipline.name}</span>
          </button>
        ))}
      </div>

      <div className="skill-detail" key={activeDiscipline.id} aria-live="polite" aria-atomic="true">
        <span className="skill-detail-index">{activeDiscipline.number} / 03</span>
        <h3>{activeDiscipline.name}</h3>
        <p>{activeDiscipline.description}</p>
      </div>
    </div>
  )
}
