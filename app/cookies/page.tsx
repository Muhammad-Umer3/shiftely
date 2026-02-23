import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'
import { LegalNav } from '@/components/legal/legal-nav'
import { LegalBackButton } from '@/components/legal/legal-back-button'

export const metadata: Metadata = {
  title: 'Cookie Policy – Shiftely',
  description: 'How Shiftely uses cookies and similar technologies.',
  alternates: {
    canonical: 'https://shiftely.com/cookies',
  },
}

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <LegalBackButton />
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">
          Last updated: {LEGAL.lastUpdatedFormatted}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to the website owners. This policy describes how {LEGAL.companyName} uses cookies and similar technologies. For general data practices, see our <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-amber-600 hover:underline">Terms of Service</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Consent</h2>
          <p className="mb-4">
            By using our website and the Shiftely service, you consent to our use of cookies as described in this policy. We do not use a separate cookie consent banner; by continuing to use the site you agree to this policy. Essential cookies are necessary for the site to function (e.g., authentication) and do not require consent. Other cookies (e.g., analytics) are used to improve the service; you can manage or disable non-essential cookies via your browser settings. Disabling cookies may limit your ability to use certain features of Shiftely.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Cookies</h2>
          <p className="mb-4">We use cookies for:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Essential:</strong> Authentication, session management, and security so the website and app work properly.</li>
            <li><strong>Functional:</strong> Remembering your preferences and settings within the Service.</li>
            <li><strong>Analytics:</strong> Understanding how visitors and users interact with our website to improve performance and experience.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies We Use</h2>
          <p className="mb-4">
            The table below lists the main cookies and cookie categories we use. Cookie names may vary slightly (e.g., with prefixes or environment-specific suffixes).
          </p>
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border px-4 py-2 text-left font-semibold">Cookie / Category</th>
                  <th className="border border-border px-4 py-2 text-left font-semibold">Provider</th>
                  <th className="border border-border px-4 py-2 text-left font-semibold">Purpose</th>
                  <th className="border border-border px-4 py-2 text-left font-semibold">Duration</th>
                  <th className="border border-border px-4 py-2 text-left font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2">next-auth.session-token (or similar)</td>
                  <td className="border border-border px-4 py-2">Shiftely (NextAuth)</td>
                  <td className="border border-border px-4 py-2">Authentication and session</td>
                  <td className="border border-border px-4 py-2">Session</td>
                  <td className="border border-border px-4 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">Session / app state</td>
                  <td className="border border-border px-4 py-2">Shiftely</td>
                  <td className="border border-border px-4 py-2">Preferences and app state</td>
                  <td className="border border-border px-4 py-2">Session or short-lived</td>
                  <td className="border border-border px-4 py-2">Essential / Functional</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">__stripe_* (e.g. __stripe_mid, __stripe_sid)</td>
                  <td className="border border-border px-4 py-2">Stripe</td>
                  <td className="border border-border px-4 py-2">Payment and fraud prevention</td>
                  <td className="border border-border px-4 py-2">Varies (see Stripe)</td>
                  <td className="border border-border px-4 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">Vercel Analytics cookies (e.g. _va_*)</td>
                  <td className="border border-border px-4 py-2">Vercel Analytics</td>
                  <td className="border border-border px-4 py-2">Usage and performance analytics</td>
                  <td className="border border-border px-4 py-2">Varies</td>
                  <td className="border border-border px-4 py-2">Analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Session vs. Persistent Cookies</h2>
          <div className="mb-4 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Session Cookies</h3>
              <p>These are temporary and expire when you close your browser. We use them to maintain your session (e.g., staying logged in) while you use Shiftely.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Persistent Cookies</h3>
              <p>These remain on your device for a set period. We use them to remember your preferences and login status across visits (where applicable).</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Third-Party Cookies</h2>
          <p className="mb-4">
            Third-party services we use may set their own cookies. These include Stripe (payments and fraud) and Vercel (analytics). Their use of cookies is governed by their respective privacy policies. We do not control third-party cookies; you can manage them through your browser or the providers&apos; tools where available.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Managing Cookies</h2>
          <p className="mb-4">
            You can control and manage cookies in your browser settings. Most browsers let you refuse or delete cookies. Note that blocking or deleting essential cookies may prevent you from logging in or using core features of Shiftely. For more on your privacy rights, see our <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. We will post the updated policy on this page and update the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p className="mb-4">
            For questions about our use of cookies, contact us at{' '}
            <a href={`mailto:${LEGAL.supportEmail}`} className="text-amber-600 hover:underline">
              {LEGAL.supportEmail}
            </a>
            {' '}or via our <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
      <LegalNav />
    </div>
  )
}
