import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/toast'

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
  title: 'Shiftely - AI-Powered Shift Scheduling | Save 10+ Hours Per Week',
  description: 'AI-powered shift scheduling software for small businesses. Eliminate scheduling conflicts, ensure compliance, and save 10+ hours per week. Free trial, no credit card required.',
  keywords: 'shift scheduling software, employee scheduling app, workforce management, AI scheduling, staff scheduling, shift management software, free scheduling tool',
  openGraph: {
    title: 'Shiftely - AI-Powered Shift Scheduling',
    description: 'Save 10+ hours per week with AI-powered shift scheduling. Free trial, no credit card required.',
    type: 'website',
    url: 'https://shiftely.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiftely - AI-Powered Shift Scheduling',
    description: 'Save 10+ hours per week with AI-powered shift scheduling.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-stone-950 text-stone-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
