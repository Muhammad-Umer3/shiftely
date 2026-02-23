import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://shiftely.com',
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/employees', '/schedules', '/schedule', '/time-off', '/swaps', '/onboarding', '/help', '/settings', '/verify-email', '/reset-password', '/forgot-password', '/register', '/accept-invite', '/p/'],
    },
    sitemap: 'https://shiftely.com/sitemap.xml',
  }
}