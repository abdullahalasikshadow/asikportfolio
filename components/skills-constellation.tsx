'use client'

import { useState } from 'react'

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
  const activeDiscipline = disciplines.find((discipline) => discipline.id === activeId) ?? disciplines[0]

  return (
    <div className="skills-visual" data-reveal>
      <div className="skills-map" role="group" aria-label="Select a practice area">
        <span className="skill-map-axis" aria-hidden="true" />
        <span className="skill-map-core" aria-hidden="true">
          AA
        </span>
        {disciplines.map((discipline) => (
          <button
            className="skill-node"
            key={discipline.id}
            type="button"
            style={{ left: `${discipline.x}%`, top: `${discipline.y}%` }}
            aria-pressed={activeId === discipline.id}
            onClick={() => setActiveId(discipline.id)}
          >
            <span className="skill-node-index">{discipline.number}</span>
            <span>{discipline.name}</span>
          </button>
        ))}
      </div>

      <div className="skill-detail" aria-live="polite" aria-atomic="true">
        <span className="skill-detail-index">{activeDiscipline.number} / 03</span>
        <h3>{activeDiscipline.name}</h3>
        <p>{activeDiscipline.description}</p>
      </div>
    </div>
  )
}
