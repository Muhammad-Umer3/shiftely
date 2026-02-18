import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { handleApiError } from '@/lib/middleware/error-handler'
import { sanitizeObject } from '@/lib/utils/validation'
import { z } from 'zod'

const contactSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const validated = contactSchema.parse(sanitized)

    // Send email to support (in production, use a support email)
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@shiftely.com'
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Support Request from ${user.email}</h2>
          <p><strong>Subject:</strong> ${validated.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${validated.message}</p>
          <hr>
          <p><small>User: ${user.email} (${user.name || 'N/A'})</small></p>
          <p><small>Organization ID: ${user.organizationId}</small></p>
        </body>
      </html>
    `

    await NotificationService.sendEmail(
      supportEmail,
      `Support Request: ${validated.subject}`,
      emailHtml
    )

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
