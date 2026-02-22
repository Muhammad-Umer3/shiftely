import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth/auth.service'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { authRateLimit } from '@/lib/middleware/rate-limit'
import { handleApiError } from '@/lib/middleware/error-handler'
import { sanitizeObject } from '@/lib/utils/validation'
import { isPersonalEmailDomain, organizationNameFromEmail } from '@/lib/email-domain'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
})

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await authRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const validated = registerSchema.parse(sanitized)

    if (isPersonalEmailDomain(validated.email)) {
      return NextResponse.json(
        {
          message:
            'Please use a work or organization email. Personal email addresses (e.g. Gmail, Yahoo) are not allowed.',
        },
        { status: 400 }
      )
    }

    const organizationName = organizationNameFromEmail(validated.email)
    const { user, organization, verificationToken } = await AuthService.register(
      validated.email,
      validated.password,
      validated.name,
      organizationName
    )

    // Send welcome email with verification link
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`
    await NotificationService.sendWelcomeEmail(user.email, user.name || '', verificationUrl)

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return handleApiError(error)
  }
}
