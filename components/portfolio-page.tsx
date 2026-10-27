import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { ContactMethods } from '@/components/contact-methods'
import { DhakaClock } from '@/components/dhaka-clock'
import { Logo } from '@/components/logo'
import { HeroCanvas } from '@/components/hero-canvas'
import { LabSection } from '@/components/lab-section'
import { PortfolioInteractions } from '@/components/portfolio-interactions'
import { SkillsConstellation } from '@/components/skills-constellation'
import { contact } from '@/content/site'

const githubUrl = 'https://github.com/abdullahalasikshadow'

function PortraitFrame() {
  return (
    <figure className="portrait-figure portrait-figure--hero">
      <div
        className="portrait-frame portrait-frame--hero"
        data-portrait-frame
        data-portrait-hero="true"
      >
        <Image
          className="portrait-image"
          src="/asik-portrait.webp"
          alt="Portrait of Abdullah Al Asik"
          width={1600}
          height={2133}
          priority
          quality={75}
          sizes="(max-width: 767px) 72vw, (max-width: 1360px) 38vw, 518px"
          data-portrait-image="true"
          style={{ objectPosition: '50% 42%' }}
        />
        <span className="portrait-tint" aria-hidden="true" />
        <span className="portrait-vignette" aria-hidden="true" />
        <span className="portrait-grain" aria-hidden="true" />
        <span className="portrait-grid" aria-hidden="true" />
        <span className="portrait-axis" aria-hidden="true" />
        <span className="portrait-tick portrait-tick--top" aria-hidden="true" />
        <span className="portrait-tick portrait-tick--side" aria-hidden="true" />
      </div>
      <figcaption className="portrait-caption">
        <span>Fig. 01, Dhaka</span>
        <span>Based in Dhaka, Bangladesh</span>
      </figcaption>
    </figure>
  )
}

export function PortfolioPage() {
  const hasAdditionalContact = Boolean(contact.email || contact.linkedin || contact.resume)
  const githubContactPill = (
    <a className="contact-link" href={githubUrl} target="_blank" rel="noreferrer" data-magnetic>
      <span>abdullahalasikshadow</span>
      <ArrowUpRight aria-hidden="true" size={18} />
    </a>
  )

  return (
    <div className="portfolio-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <PortfolioInteractions />

      <header className="site-header">
        <a className="site-brand" href="#top" aria-label="Abdullah Al Asik, home">
          <Logo className="site-brand-mark" />
          <span className="site-brand-copy">
            Statistics
            <br />
            Systems / Image
          </span>
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          <ul>
            <li>
              <a href="#about">Profile</a>
            </li>
            <li>
              <a className="nav-secondary" href="#practice">
                Practice
              </a>
            </li>
            <li>
              <a className="nav-secondary" href="#lab">
                Lab
              </a>
            </li>
            <li>
              <a className="nav-contact" href="#contact">
                Contact <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero-section" id="top" aria-labelledby="hero-title">
          <HeroCanvas />
          <div className="hero-veil" aria-hidden="true" />

          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-eyebrow" data-reveal>
                Field notes / 01 — Dhaka, Bangladesh
              </p>

              <h1 className="hero-title" id="hero-title" data-headline>
                <span className="hero-title-line display-line">
                  <span className="display-word" data-headline-word>
                    Abdullah
                  </span>
                </span>
                <span className="hero-title-line display-line">
                  <span className="display-word" data-headline-word>
                    Al
                  </span>{' '}
                  <span className="display-word" data-headline-word>
                    Asik<span className="hero-period">.</span>
                  </span>
                </span>
              </h1>

              <p className="hero-description">
                Third-year Statistics Honours student. Working across statistical analysis,
                full-stack engineering, and cinematic design.
              </p>
            </div>

            <div className="hero-portrait-column">
              <PortraitFrame />
            </div>
          </div>

          <a className="hero-scroll-cue" href="#about" data-magnetic>
            <span>Scroll to explore</span>
            <span className="hero-scroll-mark">
              <ArrowDown aria-hidden="true" size={14} />
            </span>
          </a>
        </section>

        <section className="content-section about-section" id="about" aria-labelledby="about-title">
          <div className="section-label" data-reveal>
            <span>01 / Profile</span>
            <span>Statistics · Engineering · Image</span>
          </div>

          <div className="about-layout">
            <div data-reveal>
              <h2 className="section-title" id="about-title" data-headline>
                <span className="display-line">
                  <span className="display-word" data-headline-word>One</span>{' '}
                  <span className="display-word" data-headline-word>eye</span>{' '}
                  <span className="display-word" data-headline-word>on</span>
                </span>
                <span className="display-line">
                  <span className="display-word" data-headline-word>the</span>{' '}
                  <span className="display-word" data-headline-word><em>model.</em></span>
                </span>
              </h2>
            </div>

            <div className="about-copy" data-reveal>
              <p>
                I&apos;m a third-year Statistics Honours student in the Department of Statistics at
                Rajshahi College, based in Dhaka, Bangladesh.
              </p>
              <p>
                My work spans <strong>statistical analysis</strong>,{' '}
                <strong>full-stack engineering</strong>, and <strong>cinematic design</strong>.
              </p>
            </div>
          </div>

          <div className="about-plot" data-reveal>
            <div className="plot-caption">
              <span>Observation / interpretation</span>
              <span>Signal 01 — 03</span>
            </div>
            <div className="about-plot-visual signal-chart">
              <svg viewBox="0 0 1000 230" preserveAspectRatio="none" aria-hidden="true">
                <line className="plot-grid-line" x1="0" y1="40" x2="1000" y2="40" />
                <line className="plot-grid-line" x1="0" y1="100" x2="1000" y2="100" />
                <line className="plot-grid-line" x1="0" y1="160" x2="1000" y2="160" />
                <path
                  className="plot-curve"
                  data-curve-line
                  d="M 0 158 C 85 157, 124 137, 200 137 C 290 137, 358 44, 500 48 C 634 52, 681 126, 800 119 C 874 115, 934 87, 1000 80"
                />
                <line className="plot-axis" x1="20" y1="180" x2="980" y2="180" />
                <line className="plot-crosshair plot-crosshair--analysis" x1="200" y1="137" x2="200" y2="180" />
                <line className="plot-crosshair plot-crosshair--engineering" x1="500" y1="48" x2="500" y2="180" />
                <line className="plot-crosshair plot-crosshair--design" x1="800" y1="119" x2="800" y2="180" />
                <line className="plot-tick" x1="200" y1="176" x2="200" y2="185" />
                <line className="plot-tick" x1="500" y1="176" x2="500" y2="185" />
                <line className="plot-tick" x1="800" y1="176" x2="800" y2="185" />
                <circle className="plot-point plot-point--analysis" cx="200" cy="137" r="3.5" />
                <circle className="plot-point plot-point--engineering" cx="500" cy="48" r="3.5" />
                <circle className="plot-point plot-point--design" cx="800" cy="119" r="3.5" />
              </svg>
              <div className="signal-point-labels" role="group" aria-label="Three disciplines in the signal chart">
                <div className="signal-chart-point signal-chart-point--analysis" data-point="analysis" role="img" tabIndex={0} aria-label="01 Statistical analysis">
                  01 Statistical analysis
                </div>
                <div className="signal-chart-point signal-chart-point--engineering" data-point="engineering" role="img" tabIndex={0} aria-label="02 Full-stack engineering">
                  02 Full-stack engineering
                </div>
                <div className="signal-chart-point signal-chart-point--design" data-point="design" role="img" tabIndex={0} aria-label="03 Cinematic design">
                  03 Cinematic design
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section practice-section" id="practice" aria-labelledby="practice-title">
          <div className="section-label" data-reveal>
            <span>02 / Practice</span>
            <span>Three connected disciplines</span>
          </div>

          <div className="practice-layout">
            <div className="practice-heading" data-reveal>
              <h2 className="section-title" id="practice-title" data-headline>
                <span className="display-line">
                  <span className="display-word" data-headline-word>Three</span>{' '}
                  <span className="display-word" data-headline-word>fields.</span>
                </span>
                <span className="display-line">
                  <span className="display-word" data-headline-word>One</span>{' '}
                  <span className="display-word" data-headline-word><em>frame.</em></span>
                </span>
              </h2>
              <p>
                Select a point in the constellation to explore the three areas my work spans.
              </p>
            </div>

            <SkillsConstellation />
          </div>
        </section>

        <LabSection />

        <section className="content-section journey-section" id="journey" aria-labelledby="journey-title">
          <div className="section-label" data-reveal>
            <span>04 / Current coordinates</span>
            <span>Study / Place</span>
          </div>

          <div className="journey-layout">
            <h2 className="journey-title" id="journey-title" data-headline>
              <span className="display-word" data-headline-word>In</span>{' '}
              <span className="display-word" data-headline-word><em>progress.</em></span>
            </h2>

            <div className="journey-now" data-reveal>
              <span className="journey-timeline-line" data-journey-line aria-hidden="true" />
              <span className="journey-timeline-dot" data-journey-dot aria-hidden="true" />
              <span className="journey-current">Now / Third year</span>
              <h3>Statistics Honours</h3>
              <p>
                Department of Statistics
                <br />
                Rajshahi College
              </p>
            </div>

            <div className="journey-place" data-reveal>
              <span className="journey-place-label">Based in</span>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-inner">
            <p className="contact-overline" data-reveal>
              05 / Contact
            </p>

            <h2 className="contact-title" id="contact-title" data-headline>
              <span className="display-line">
                <span className="display-word" data-headline-word>Start</span>{' '}
                <span className="display-word" data-headline-word>a</span>
              </span>
              <span className="display-line">
                <span className="display-word" data-headline-word><em>conversation.</em></span>
              </span>
            </h2>

            <div className="contact-bottom" data-reveal>
              <p className="contact-copy">
                For contact, find me on GitHub as abdullahalasikshadow.
              </p>

              {hasAdditionalContact ? (
                <div className="contact-link-stack">
                  {githubContactPill}
                  <ContactMethods
                    email={contact.email}
                    linkedin={contact.linkedin}
                    resume={contact.resume}
                  />
                </div>
              ) : (
                githubContactPill
              )}

              <div className="contact-location">
                <span className="contact-location-label">Based in</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p className="footer-copy">© 2026 Abdullah Al Asik</p>
        <Logo className="footer-mark" />
        <div className="local-time">
          <span className="local-time-label">Dhaka local time</span>
          <DhakaClock />
        </div>
      </footer>

    </div>
  )
}
