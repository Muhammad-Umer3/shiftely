import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'
import { LegalNav } from '@/components/legal/legal-nav'
import { LegalBackButton } from '@/components/legal/legal-back-button'

export const metadata: Metadata = {
  title: 'Terms of Service – Shiftely',
  description: 'Terms of Service for Shiftely, AI-powered shift scheduling for small businesses.',
  alternates: {
    canonical: 'https://shiftely.com/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <LegalBackButton />
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">
          Last updated: {LEGAL.lastUpdatedFormatted}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
          <p className="mb-4">
            In these Terms, &quot;Service&quot; means the Shiftely platform, including the website, applications, and all related features for AI-assisted shift scheduling and workforce management. &quot;User&quot; or &quot;you&quot; means the person or entity accessing or using the Service. &quot;Content&quot; means any data, text, schedules, employee information, or other materials you submit through the Service. &quot;Organization&quot; means the business or tenant account to which your use is linked (multi-tenant structure).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using {LEGAL.companyName}, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Description of Service</h2>
          <p className="mb-4">
            {LEGAL.companyName} provides an AI-powered shift scheduling and workforce management service for small businesses. Features include drag-and-drop scheduling, AI-generated schedule suggestions, employee management, shift swaps, time-off requests, compliance and overtime tracking, payroll export, and email notifications. We may modify, suspend, or discontinue features with reasonable notice where practicable. AI-generated schedules are decision-support tools only; you remain responsible for final scheduling and labor decisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years of age (or the age of majority in your jurisdiction) to use the Service. If you are using the Service on behalf of a business, you represent that you have the authority to bind that business and that the business is duly organized and validly existing. The Service is intended for commercial use by businesses and their authorized users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Account Registration and Security</h2>
          <p className="mb-4">
            You must provide accurate and complete registration information and keep it up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us promptly of any unauthorized use. We are not liable for losses arising from unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Use License and Restrictions</h2>
          <p className="mb-4">
            We grant you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business purposes in accordance with these Terms. You may not:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Copy, modify, or create derivative works of the Service or its content</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
            <li>Remove or alter any copyright or proprietary notices</li>
            <li>Resell, sublicense, or redistribute the Service or access to it</li>
            <li>Use the Service for any illegal purpose or in violation of applicable laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
          <p className="mb-4">
            You agree not to use the Service to: (a) violate any law or regulation; (b) infringe any third-party rights; (c) transmit malware or harmful code; (d) abuse, harass, or harm other users or our systems; (e) attempt to gain unauthorized access to the Service or related systems; (f) use automated means to scrape or overload the Service except as permitted; (g) use the Service in any way that could harm minors. We may suspend or terminate your access immediately for violation of this section.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Free Trial</h2>
          <p className="mb-4">
            We may offer a free trial (e.g., 7 days). No payment is required until the trial ends. If you do not cancel before the end of the trial, your chosen subscription plan will begin and you will be charged according to the plan. You may cancel at any time during the trial to avoid being charged.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Subscription and Billing</h2>
          <p className="mb-4">
            Subscriptions are billed in advance on a monthly or annual basis via our payment processor, Stripe. Fees are non-refundable for partial billing periods except where required by law. We may change prices with at least 30 days&apos; notice; continued use after the change constitutes acceptance. You are responsible for any taxes applicable to your use. Failure to pay may result in suspension or termination of access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
          <p className="mb-4">
            You may cancel your subscription and close your account at any time. We may suspend or terminate your access immediately for breach of these Terms, non-payment, or to protect the Service or other users. Upon termination, your right to use the Service ceases. We may retain data as described in our <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Data and Privacy</h2>
          <p className="mb-4">
            Your use of the Service is also governed by our <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your and your organization&apos;s data (including employee and schedule data). By using the Service you consent to that processing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify, defend, and hold harmless {LEGAL.companyName}, its affiliates, and their officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service, your Content, or your breach of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Disclaimers</h2>
          <p className="mb-4">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. AI-GENERATED SCHEDULES AND SUGGESTIONS ARE FOR DECISION-SUPPORT ONLY; YOU REMAIN RESPONSIBLE FOR COMPLIANCE WITH LABOR LAWS, OVERTIME, AND ALL EMPLOYMENT DECISIONS.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL {LEGAL.companyName} OR ITS SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (OR ONE HUNDRED US DOLLARS IF GREATER). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN SUCH CASES OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Governing Law and Jurisdiction</h2>
          <p className="mb-4">
            These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in Delaware, and you consent to personal jurisdiction there.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. General</h2>
          <p className="mb-4">
            If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in effect. These Terms, together with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and {LEGAL.companyName}. Our failure to enforce any right is not a waiver. You may not assign these Terms; we may assign them in connection with a merger, acquisition, or sale of assets. Headings are for convenience only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">17. Changes to Terms</h2>
          <p className="mb-4">
            We may revise these Terms at any time. We will post the updated Terms on this page and update the &quot;Last updated&quot; date. Material changes may be communicated by email or a notice on the Service. Continued use after changes constitutes acceptance. If you do not agree, you must stop using the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">18. Contact</h2>
          <p className="mb-4">
            For questions about these Terms of Service, contact us at{' '}
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
