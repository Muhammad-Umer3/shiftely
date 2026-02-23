import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Shiftely',
  description:
    'Get in touch with Shiftely. Questions about AI-powered shift scheduling, support, or partnerships.',
  alternates: {
    canonical: 'https://shiftely.com/contact',
  },
  openGraph: {
    title: 'Contact | Shiftely',
    description:
      'Get in touch with Shiftely. Questions about AI-powered shift scheduling, support, or partnerships.',
    url: 'https://shiftely.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
