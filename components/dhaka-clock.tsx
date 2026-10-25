'use client'

import { useEffect, useState } from 'react'

function getDhakaTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function DhakaClock() {
  const [time, setTime] = useState('--:--')

  useEffect(() => {
    const updateTime = () => setTime(getDhakaTime())
    updateTime()
    const interval = window.setInterval(updateTime, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <time className="local-time-value" dateTime={time} aria-label={`Current local time in Dhaka, Bangladesh: ${time}`}>
      {time}
    </time>
  )
}
