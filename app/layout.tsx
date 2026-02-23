import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { NotFoundProvider } from '@/components/providers/not-found-provider'
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

const metadataBase = new URL('https://shiftely.com')

export const metadata: Metadata = {
  metadataBase,
  title: 'Shiftely – Employee & Staff Scheduling Software | Roster Software for Small Business',
  description: 'Employee scheduling and staff scheduling software that doubles as roster software. AI builds your roster in minutes. Shift swaps, time-off, payroll export. Built for small teams.',
  keywords: 'employee scheduling software, staff scheduling software, roster software, shift scheduling software, employee scheduling app, workforce management, AI scheduling, staff scheduling, shift management software, free scheduling tool',
  alternates: {
    canonical: 'https://shiftely.com',
  },
  openGraph: {
    title: 'Shiftely – Employee & Staff Scheduling Software | Roster for Small Business',
    description: 'Employee scheduling and staff roster software. AI builds your schedule in minutes. 7-day free trial.',
    type: 'website',
    url: 'https://shiftely.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiftely – Employee & Staff Scheduling Software | Roster for Small Business',
    description: 'Employee scheduling and staff roster software. AI builds your schedule in minutes.',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
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
      description: 'Shiftely is employee scheduling and staff scheduling software (roster software) for small businesses. AI-powered shift and roster scheduling in minutes.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Shiftely',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Employee scheduling software and staff scheduling software for small business. Roster software with AI-built schedules, shift swaps, time-off, and payroll export.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does Shiftely cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free: up to 5 employees and 1 active schedule—no card required. Growth: $29/mo for up to 15 employees and unlimited schedules, plus shift swaps. Pro: $79/mo for up to 100 employees, custom roles, and priority support. Paid plans include a 7-day free trial.',
      },
    },
    {
      '@type': 'Question',
      name: "I'm drowning in spreadsheets and last-minute changes. Will this actually help?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Shiftely gives you one place for schedules and availability, so you stop retyping and chasing. AI generates a draft in minutes so you tweak instead of build from scratch. Notifications mean your team always sees their shifts, so you get fewer \"I didn't know I was working\" no-shows. Many teams save hours every week and cut scheduling conflicts to zero.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI scheduling work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Add your employees and set their availability (which days and times they can work). When you need a schedule for a week, click "Generate with AI." The AI uses everyone\'s availability to create an optimal schedule. You can review, tweak, and publish. No technical skills required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can employees swap shifts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes! Employees can request shift swaps directly through the platform, and managers can approve or reject them with a single click. The system automatically checks for conflicts before allowing swaps. This feature is available on Growth and Pro plans.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a mobile app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Currently, Shiftely works great on mobile browsers with a fully responsive design. Employees can view schedules and swap shifts from any device. A dedicated mobile app is coming soon!',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I exceed my employee limit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "You'll receive a friendly notification when you're approaching your limit. If you need to add more employees, you can easily upgrade your plan with a single click. No data is ever lost during plan changes.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need technical skills to use Shiftely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Shiftely is built for SMEs with non-technical staff. Add employees, set availability, and let AI generate schedules. It\'s designed to be simple from day one.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes! All paid plans come with a 7-day free trial with full access to all features. A credit card is required to start your trial, but you won't be charged until the trial ends. Cancel anytime before the trial ends and you won't be charged.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="font-sans bg-stone-950 text-stone-50 antialiased">
        <NotFoundProvider>
          <SessionProvider>{children}</SessionProvider>
          <ContactFloatButton />
        </NotFoundProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
