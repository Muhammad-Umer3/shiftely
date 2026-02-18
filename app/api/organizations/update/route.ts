import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'
import { z } from 'zod'
import { sanitizeObject } from '@/lib/utils/validation'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const validated = updateSchema.parse(sanitized)

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (organization.settings as Record<string, any>) || {}
    if (validated.timezone) {
      settings.timezone = validated.timezone
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        ...(validated.name && { name: validated.name }),
        settings,
      },
    })

    return NextResponse.json({ message: 'Organization updated' }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
