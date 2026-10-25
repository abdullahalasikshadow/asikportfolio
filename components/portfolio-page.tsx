import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { DhakaClock } from '@/components/dhaka-clock'
import { HeroCanvas } from '@/components/hero-canvas'
import { PortfolioInteractions } from '@/components/portfolio-interactions'
import { SkillsConstellation } from '@/components/skills-constellation'

const githubUrl = 'https://github.com/abdullahalasikshadow'

const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Abdullah Al Asik',
  description:
    'Third-year Statistics Honours student at Rajshahi College, based in Dhaka, Bangladesh. Work spans statistical analysis, full-stack engineering, and cinematic design.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dhaka',
    addressCountry: 'BD',
  },
  sameAs: [githubUrl],
  knowsAbout: ['Statistical analysis', 'Full-stack engineering', 'Cinematic design'],
}

function PortraitFrame({ variant }: { variant: 'hero' | 'about' }) {
  const isHero = variant === 'hero'

  return (
    <figure className={`portrait-figure ${isHero ? 'portrait-figure--hero' : 'portrait-figure--about'}`}>
      <div
        className={`portrait-frame ${isHero ? 'portrait-frame--hero' : 'portrait-frame--quiet'}`}
        data-portrait-frame
        data-portrait-hero={isHero ? 'true' : undefined}
      >
        <Image
          className="portrait-image"
          src="/asik-portrait.webp"
          alt="Portrait of Abdullah Al Asik"
          width={1600}
          height={2133}
          priority={isHero}
          quality={82}
          sizes={
            isHero
              ? '(max-width: 760px) 76px, (max-width: 1280px) 10vw, 128px'
              : '(max-width: 760px) 72px, (max-width: 1160px) 10vw, 116px'
          }
          data-portrait-image="true"
          style={{ objectPosition: isHero ? '50% 45%' : '50% 42%' }}
        />
        <span className="portrait-tint" aria-hidden="true" />
        <span className="portrait-vignette" aria-hidden="true" />
        <span className="portrait-grain" aria-hidden="true" />
        <span className="portrait-grid" aria-hidden="true" />
        <span className="portrait-tick portrait-tick--top" aria-hidden="true" />
        <span className="portrait-tick portrait-tick--side" aria-hidden="true" />
      </div>
      {isHero && <figcaption className="portrait-caption">Fig. 01, Dhaka</figcaption>}
    </figure>
  )
}

export function PortfolioPage() {
  return (
    <div className="portfolio-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <PortfolioInteractions />

      <header className="site-header">
        <a className="site-brand" href="#top" aria-label="Abdullah Al Asik, home">
          <span className="site-brand-mark" aria-hidden="true">
            A/A
          </span>
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
            <p className="hero-eyebrow">Field notes / 01 — Dhaka, Bangladesh</p>

            <h1 className="hero-title" id="hero-title">
              <span className="hero-title-line">
                <span className="hero-title-word" data-hero-word>
                  Abdullah
                </span>
              </span>
              <span className="hero-title-line">
                <span className="hero-title-word" data-hero-word>
                  Al Asik<span className="hero-period">.</span>
                </span>
              </span>
            </h1>

            <div className="hero-bottom">
              <p className="hero-description">
                Third-year Statistics Honours student. Working across statistical analysis,
                full-stack engineering, and cinematic design.
              </p>

              <div className="hero-side-info">
                <a className="hero-scroll-cue" href="#about" data-magnetic>
                  <span>Scroll to explore</span>
                  <span className="hero-scroll-mark">
                    <ArrowDown aria-hidden="true" size={14} />
                  </span>
                </a>

                <div className="hero-avatar-lockup">
                  <PortraitFrame variant="hero" />
                  <div className="hero-avatar-copy">
                    <span>Based in</span>
                    <span>Dhaka, Bangladesh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section about-section" id="about" aria-labelledby="about-title">
          <div className="section-label" data-reveal>
            <span>01 / Profile</span>
            <span>Statistics · Engineering · Image</span>
          </div>

          <div className="about-layout">
            <div data-reveal>
              <h2 className="section-title" id="about-title">
                One eye on
                <br />
                the <em>model.</em>
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
            <div className="about-plot-visual">
              <svg viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true">
                <line className="plot-grid-line" x1="0" y1="30" x2="1000" y2="30" />
                <line className="plot-grid-line" x1="0" y1="75" x2="1000" y2="75" />
                <line className="plot-grid-line" x1="0" y1="120" x2="1000" y2="120" />
                <path
                  className="plot-curve"
                  data-curve-line
                  d="M 0 119 C 98 113, 139 102, 212 102 C 295 102, 321 38, 396 34 C 474 29, 492 94, 579 93 C 677 92, 706 58, 785 63 C 866 69, 906 90, 1000 74"
                />
                <circle className="plot-point" cx="212" cy="102" r="3" />
                <circle className="plot-point" cx="396" cy="34" r="3" />
                <circle className="plot-point" cx="579" cy="93" r="3" />
                <circle className="plot-point" cx="785" cy="63" r="3" />
              </svg>
              <PortraitFrame variant="about" />
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
              <h2 className="section-title" id="practice-title">
                Three fields.
                <br />
                One <em>frame.</em>
              </h2>
              <p>
                Select a point in the constellation to explore the three areas my work spans.
              </p>
            </div>

            <SkillsConstellation />
          </div>
        </section>

        <section className="content-section project-section" id="work" aria-labelledby="work-title">
          <div className="section-label" data-reveal>
            <span>03 / Selected project</span>
            <span>01 — AURA Bot</span>
          </div>

          <div className="project-layout">
            <figure
              className="project-art"
              data-project-pin
              data-cursor="interactive"
              aria-label="AURA Bot, a Telegram bot"
            >
              <div className="project-art-grid" aria-hidden="true" />
              <div className="project-art-top" aria-hidden="true">
                <span>Project / 001</span>
                <span>Telegram / Bot</span>
              </div>
              <div className="project-signal" aria-hidden="true">
                <svg viewBox="0 0 600 400" preserveAspectRatio="none">
                  <path d="M 14 300 C 94 260, 138 325, 205 236 S 300 102, 356 192 S 448 320, 586 82" />
                  <circle cx="205" cy="236" r="4" />
                  <circle cx="356" cy="192" r="4" />
                  <circle cx="500" cy="196" r="4" />
                </svg>
                <div className="project-wordmark">
                  AURA
                  <span>BOT</span>
                </div>
              </div>
              <figcaption className="project-art-footer">
                <span>AURA Bot</span>
                <span>Telegram bot</span>
              </figcaption>
            </figure>

            <div className="project-story" data-reveal>
              <p className="project-type">Featured project / 01</p>
              <h2 className="project-title" id="work-title">
                AURA
                <span>Bot.</span>
              </h2>
              <p className="project-summary">AURA Bot is a Telegram bot.</p>

              <dl className="project-facts">
                <div>
                  <dt className="fact-label">Type</dt>
                  <dd>Telegram bot</dd>
                </div>
                <div>
                  <dt className="fact-label">Project</dt>
                  <dd>AURA Bot</dd>
                </div>
              </dl>

              <a className="project-profile-link" href={githubUrl} target="_blank" rel="noreferrer">
                GitHub profile <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="content-section journey-section" id="journey" aria-labelledby="journey-title">
          <div className="section-label" data-reveal>
            <span>04 / Current coordinates</span>
            <span>Study / Place</span>
          </div>

          <div className="journey-layout">
            <h2 className="journey-title" id="journey-title" data-reveal>
              In <em>progress.</em>
            </h2>

            <div className="journey-now" data-reveal>
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

            <h2 className="contact-title" id="contact-title" data-reveal>
              Start a
              <br />
              <em>conversation.</em>
            </h2>

            <div className="contact-bottom" data-reveal>
              <p className="contact-copy">
                For contact, find me on GitHub as abdullahalasikshadow.
              </p>

              <a className="contact-link" href={githubUrl} target="_blank" rel="noreferrer" data-magnetic>
                <span>abdullahalasikshadow</span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>

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
        <span className="footer-mark" aria-hidden="true">
          A/A
        </span>
        <div className="local-time">
          <span className="local-time-label">Dhaka local time</span>
          <DhakaClock />
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personStructuredData).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  )
}
