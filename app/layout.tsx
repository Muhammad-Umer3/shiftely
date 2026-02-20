import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/toast'
import { ContactFloatButton } from '@/components/landing/contact-float-button'
import { Analytics } from '@vercel/analytics/next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shiftely - AI-Powered Shift Scheduling for Small Businesses',
  description: 'AI-powered shift scheduling for SMEs. Add employees, set availability, and let AI generate schedules in minutes. No spreadsheets, no technical skills required.',
  keywords: 'shift scheduling software, employee scheduling app, workforce management, AI scheduling, staff scheduling, shift management software, free scheduling tool',
  openGraph: {
    title: 'Shiftely - AI-Powered Shift Scheduling for Small Businesses',
    description: 'AI-powered shift scheduling for SMEs. Save hours every week. 7-day free trial.',
    type: 'website',
    url: 'https://shiftely.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiftely - AI-Powered Shift Scheduling for Small Businesses',
    description: 'AI-powered shift scheduling for SMEs. Save hours every week.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://shiftely.com/#organization',
      name: 'Shiftely',
      url: 'https://shiftely.com',
      description: 'AI-powered shift scheduling for small businesses. Generate schedules in minutes, not hours.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Shiftely',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AI-powered shift scheduling for SMEs. Add employees, set availability, and let AI generate schedules in minutes.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="font-sans bg-stone-950 text-stone-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
        <ContactFloatButton />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
