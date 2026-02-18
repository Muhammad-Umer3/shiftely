import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { AuthService } from '@/server/services/auth/auth.service'
import { handleApiError } from '@/lib/middleware/error-handler'
import { sanitizeObject } from '@/lib/utils/validation'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const { email } = inviteSchema.parse(sanitized)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId: user.organizationId,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingInvite) {
      return NextResponse.json(
        { message: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Create invitation
    const token = AuthService.generateToken()
    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId: user.organizationId,
        invitedById: user.id,
        token,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`
    await NotificationService.sendInvitationEmail(
      email,
      user.name || user.email,
      organization?.name || 'Organization',
      inviteUrl
    )

    return NextResponse.json(
      { message: 'Invitation sent successfully', invitation },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
