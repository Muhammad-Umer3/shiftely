import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Book, MessageCircle, HelpCircle, FileText } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Help Center</h1>
        <p className="text-stone-600 mt-1">Find answers and get support</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-stone-200 bg-white hover:border-amber-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-stone-900">Documentation</CardTitle>
            </div>
            <CardDescription className="text-stone-600">
              Learn how to use Shiftely&apos;s features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/help/faq" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Getting Started Guide
                </Link>
              </li>
              <li>
                <Link href="/dashboard/help/faq" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Creating Schedules
                </Link>
              </li>
              <li>
                <Link href="/dashboard/help/faq" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Managing Employees
                </Link>
              </li>
              <li>
                <Link href="/dashboard/help/faq" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Shift Swaps
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white hover:border-amber-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-stone-900">FAQ</CardTitle>
            </div>
            <CardDescription className="text-stone-600">
              Frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 mb-4">
              Find answers to common questions about using Shiftely.
            </p>
            <Link href="/dashboard/help/faq">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30">View FAQ</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white hover:border-amber-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-stone-900">Contact Support</CardTitle>
            </div>
            <CardDescription className="text-stone-600">
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 mb-4">
              Have a question? Send us a message and we&apos;ll get back to you.
            </p>
            <Link href="/dashboard/help/contact">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30">Contact Us</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white hover:border-amber-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-stone-900">Legal</CardTitle>
            </div>
            <CardDescription className="text-stone-600">
              Terms, privacy, and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-amber-600 hover:text-amber-500 hover:underline">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
