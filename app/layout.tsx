import { Analytics } from '@vercel/analytics/next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { siteUrl } from '@/content/site'
import './globals.css'

const displayFont = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const siteDescription =
  'Abdullah Al Asik is a third-year Statistics Honours student at Rajshahi College, based in Dhaka, working across statistical analysis, full-stack engineering, and cinematic design.'

const metadataBase = new URL(siteUrl)

const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Abdullah Al Asik',
  url: siteUrl,
  image: new URL('/asik-portrait.webp', siteUrl).toString(),
  sameAs: ['https://github.com/abdullahalasikshadow'],
  description: siteDescription,
}

export const metadata: Metadata = {
  metadataBase,
  alternates: { canonical: '/' },
  title: 'Abdullah Al Asik — Statistics × Systems × Image',
  description: siteDescription,
  applicationName: 'Abdullah Al Asik',
  keywords: [
    'Abdullah Al Asik',
    'Statistics Honours',
    'statistical analysis',
    'full-stack engineering',
    'cinematic design',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Abdullah Al Asik — Statistics × Systems × Image',
    description: siteDescription,
    siteName: 'Abdullah Al Asik',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abdullah Al Asik — Statistics × Systems × Image',
    description: siteDescription,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#090b08',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personStructuredData).replace(/</g, '\\u003c'),
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
