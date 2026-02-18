import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = contactSchema.parse(body)

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@shiftely.com'
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Contact Form - Shiftely</h2>
          <p><strong>From:</strong> ${validated.name} (${validated.email})</p>
          <p><strong>Subject:</strong> ${validated.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${validated.message}</p>
          <hr>
          <p><small>Sent from public contact form</small></p>
        </body>
      </html>
    `

    await NotificationService.sendEmail(
      supportEmail,
      `Contact: ${validated.subject}`,
      emailHtml
    )

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 }
      )
    }
    console.error('Contact form error:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
