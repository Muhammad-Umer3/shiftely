import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { z } from 'zod'

const earlyAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = earlyAccessSchema.parse(body)

    await prisma.earlyAccessSignup.create({
      data: {
        email: validated.email,
        message: validated.message,
      },
    })

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@shiftely.com'
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Early Access Signup - Shiftely</h2>
          <p><strong>Email:</strong> ${validated.email}</p>
          <p><strong>Problem statement:</strong></p>
          <p>${validated.message}</p>
          <hr>
          <p><small>Early access waitlist signup</small></p>
        </body>
      </html>
    `

    await NotificationService.sendEmail(
      supportEmail,
      `Early Access: ${validated.email}`,
      emailHtml
    )

    return NextResponse.json(
      { message: 'You\'re on the list! We\'ll be in touch.' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 }
      )
    }
    console.error('Early access signup error:', error)
    return NextResponse.json(
      { message: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
