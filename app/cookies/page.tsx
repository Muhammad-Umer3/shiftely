export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
          <div className="mb-4 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Session Cookies</h3>
              <p>These are temporary cookies that expire when you close your browser. We use them to maintain your session while using Shiftely.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Persistent Cookies</h3>
              <p>These cookies remain on your device for a set period. We use them to remember your preferences and login status.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
          <p className="mb-4">
            We may use third-party services that set cookies on your device. These include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Analytics services to understand website usage</li>
            <li>Payment processors for secure transactions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
          <p className="mb-4">
            You can control and manage cookies in various ways. Most browsers allow you to refuse or accept cookies. However, disabling cookies may limit your ability to use certain features of Shiftely.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p className="mb-4">
            If you have questions about our use of cookies, please contact us at support@shiftely.com.
          </p>
        </section>
      </div>
    </div>
  )
}
