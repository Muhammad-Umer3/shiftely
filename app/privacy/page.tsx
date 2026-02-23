import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'
import { LegalNav } from '@/components/legal/legal-nav'
import { LegalBackButton } from '@/components/legal/legal-back-button'

export const metadata: Metadata = {
  title: 'Privacy Policy – Shiftely',
  description: 'Privacy Policy for Shiftely: how we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://shiftely.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <LegalBackButton />
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">
          Last updated: {LEGAL.lastUpdatedFormatted}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Who We Are / Data Controller</h2>
          <p className="mb-4">
            {LEGAL.companyName} (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates the Shiftely platform and is the data controller for the personal data we process as described in this policy. For privacy-related requests or questions, contact us at{' '}
            <a href={`mailto:${LEGAL.privacyEmail}`} className="text-amber-600 hover:underline">
              {LEGAL.privacyEmail}
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly and data generated from your use of the Service, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account and profile:</strong> name, email address, password (hashed), and any profile details you add.</li>
            <li><strong>Organization and employee data:</strong> business name, employee names, roles, contact details (email, phone), availability, and other information you enter for scheduling.</li>
            <li><strong>Schedule and shift data:</strong> shifts, schedules, swap requests, time-off requests, and compliance or overtime-related data.</li>
            <li><strong>Payment information:</strong> processed securely by our payment provider (Stripe); we do not store full card numbers.</li>
            <li><strong>Technical and usage data:</strong> IP address, browser type, device information, log data, and analytics (e.g., how you use the site) to operate and improve the Service.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, maintain, and improve the Service (including AI-powered schedule suggestions)</li>
            <li>Process subscriptions and payments and send related communications</li>
            <li>Send technical notices, security alerts, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends, usage, and performance</li>
            <li>Comply with legal obligations and protect our rights and safety</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Legal Basis (GDPR)</h2>
          <p className="mb-4">
            If you are in the European Economic Area (EEA), we process your data based on: (a) <strong>contract</strong>—to provide the Service you signed up for; (b) <strong>legitimate interests</strong>—to improve the Service, ensure security, and communicate with you; (c) <strong>legal obligation</strong>—where we must retain or disclose data by law; and (d) <strong>consent</strong>—where we ask for it explicitly (e.g., marketing). You may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. AI and Automated Processing</h2>
          <p className="mb-4">
            We use AI (including Google Generative AI / Gemini) to provide schedule suggestions and optimization. This is decision-support only; we do not make fully automated decisions that have legal or similarly significant effects on you. You remain responsible for final scheduling and employment decisions. For more on how Google processes data, see Google&apos;s privacy policy and our subprocessors below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your information only:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>With your consent</li>
            <li>With service providers (subprocessors) who assist us under contract—see Section 7</li>
            <li>To comply with legal obligations or valid legal process</li>
            <li>To protect our rights, safety, or property, or that of our users or the public</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Subprocessors</h2>
          <p className="mb-4">
            We use the following categories of service providers that may process personal data on our behalf. They process data in accordance with their own privacy policies and our instructions:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Stripe</strong>—payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Stripe Privacy Policy</a></li>
            <li><strong>Resend</strong>—transactional and notification emails. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Resend Privacy Policy</a></li>
            <li><strong>Vercel</strong>—hosting and analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Vercel Privacy Policy</a></li>
            <li><strong>Google</strong>—AI services (e.g., Gemini) for schedule suggestions. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Privacy Policy</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
          <p className="mb-4">
            Your data may be processed in the United States and other countries where our service providers operate. If you are in the EEA or UK, we rely on adequacy decisions, standard contractual clauses, or other approved transfer mechanisms to ensure appropriate safeguards. You may request details of the safeguards we use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, access controls, and secure development practices. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Your Rights (GDPR / EEA)</h2>
          <p className="mb-4">
            If you are in the EEA or UK, you have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Access</strong>—request a copy of your personal data</li>
            <li><strong>Rectification</strong>—correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong>—request deletion (&quot;right to be forgotten&quot;) where applicable</li>
            <li><strong>Restrict processing</strong>—limit how we use your data in certain cases</li>
            <li><strong>Data portability</strong>—receive your data in a structured, machine-readable format</li>
            <li><strong>Object</strong>—object to processing based on legitimate interests or for direct marketing</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, contact us at{' '}
            <a href={`mailto:${LEGAL.privacyEmail}`} className="text-amber-600 hover:underline">
              {LEGAL.privacyEmail}
            </a>
            . We may need to verify your identity. We will respond within the time required by applicable law (e.g., one month under GDPR). You also have the right to lodge a complaint with a supervisory authority in your country of residence.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. CCPA / California Rights</h2>
          <p className="mb-4">
            If you are a California resident, you have the right to: know what personal information we collect and how it is used; request deletion of your personal information; correct inaccuracies; and request portability. We do not sell or share personal information for cross-context behavioral advertising as defined under the CCPA. To exercise your rights, contact us at{' '}
            <a href={`mailto:${LEGAL.privacyEmail}`} className="text-amber-600 hover:underline">
              {LEGAL.privacyEmail}
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as necessary to provide the Service, comply with legal obligations (e.g., tax, accounting), resolve disputes, and enforce our agreements. When you close your account, we may retain certain data for a limited period for backup, legal, or legitimate business purposes, after which it is deleted or anonymized.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Children</h2>
          <p className="mb-4">
            The Service is not directed at individuals under 16. We do not knowingly collect personal information from children under 16. If you believe we have collected such information, please contact us at {LEGAL.privacyEmail} and we will delete it promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar technologies as described in our <Link href="/cookies" className="text-amber-600 hover:underline">Cookie Policy</Link>. That policy explains the types of cookies we use and how you can manage them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Updates</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the &quot;Last updated&quot; date. For material changes, we may notify you by email or a prominent notice on the Service. Your continued use after the effective date constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
          <p className="mb-4">
            For questions about this Privacy Policy or our privacy practices, contact us at{' '}
            <a href={`mailto:${LEGAL.privacyEmail}`} className="text-amber-600 hover:underline">
              {LEGAL.privacyEmail}
            </a>
            {' '}or via our <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
      <LegalNav />
    </div>
  )
}
