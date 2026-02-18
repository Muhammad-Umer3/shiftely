import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Book, MessageCircle, HelpCircle, FileText } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">Find answers and get support</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>
              Learn how to use Shiftely's features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help/faq" className="text-primary hover:underline">
                  Getting Started Guide
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-primary hover:underline">
                  Creating Schedules
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-primary hover:underline">
                  Managing Employees
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-primary hover:underline">
                  Shift Swaps
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <CardTitle>FAQ</CardTitle>
            </div>
            <CardDescription>
              Frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find answers to common questions about using Shiftely.
            </p>
            <Link href="/help/faq">
              <Button variant="outline">View FAQ</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>Contact Support</CardTitle>
            </div>
            <CardDescription>
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Have a question? Send us a message and we'll get back to you.
            </p>
            <Link href="/help/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Legal</CardTitle>
            </div>
            <CardDescription>
              Terms, privacy, and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-primary hover:underline">
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
