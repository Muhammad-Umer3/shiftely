import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { handleApiError } from '@/lib/middleware/error-handler'
import { sanitizeObject } from '@/lib/utils/validation'
import { z } from 'zod'

const acceptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const { token, name, password } = acceptSchema.parse(sanitized)

    // Get invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { message: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Invitation has already been used' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user and employee
    const passwordHash = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          passwordHash,
          role: 'EMPLOYEE',
          organizationId: invitation.organizationId,
          emailVerified: false,
          employee: {
            create: {
              organizationId: invitation.organizationId,
            },
          },
        },
        include: {
          employee: true,
        },
      })

      // Assign employee role
      const employeeRole = await PermissionService.getOrCreateEmployeeRole(
        invitation.organizationId
      )

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: employeeRole.id,
          assignedById: invitation.invitedById,
        },
      })

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
        },
      })

      return user
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
