'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

type ContactMethodsProps = {
  email: string
  linkedin: string
  resume: string
}

export function ContactMethods({ email, linkedin, resume }: ContactMethodsProps) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emailAddress = email.trim()
  const linkedinUrl = linkedin.trim()
  const resumeUrl = resume.trim()

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  async function copyEmail() {
    let didCopy = false

    try {
      await navigator.clipboard.writeText(emailAddress)
      didCopy = true
    } catch {
      const textArea = document.createElement('textarea')
      const previouslyFocusedElement = document.activeElement
      textArea.value = emailAddress
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('aria-hidden', 'true')
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)

      try {
        textArea.focus()
        textArea.select()
        didCopy = document.execCommand('copy')
      } catch {
        didCopy = false
      } finally {
        textArea.remove()
        if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus()
      }
    }

    if (!didCopy) return
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setCopied(true)
    copyTimer.current = setTimeout(() => {
      setCopied(false)
      copyTimer.current = null
    }, 1500)
  }

  if (!emailAddress && !linkedinUrl && !resumeUrl) return null

  return (
    <ul className="contact-secondary-links" aria-label="Additional contact options">
      {emailAddress ? (
        <li>
          <div className="contact-secondary-pill contact-secondary-pill--email">
            <a className="contact-secondary-email" href={`mailto:${emailAddress}`}>
              {emailAddress}
            </a>
            <button
              className="contact-secondary-copy"
              type="button"
              onClick={copyEmail}
              aria-label={copied ? 'Email address copied' : 'Copy email address'}
            >
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </li>
      ) : null}
      {linkedinUrl ? (
        <li>
          <a className="contact-secondary-pill" href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            LinkedIn
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </li>
      ) : null}
      {resumeUrl ? (
        <li>
          <a className="contact-secondary-pill" href={resumeUrl} target="_blank" rel="noopener noreferrer">
            Resume (PDF)
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </li>
      ) : null}
    </ul>
  )
}
