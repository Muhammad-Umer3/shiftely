import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'
import { z } from 'zod'

const bodySchema = z.object({
  step: z.number().int().min(1).max(5),
})

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { step } = bodySchema.parse(body)

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (organization.settings as Record<string, unknown>) || {}
    settings.onboardingStep = step

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        settings: settings as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({ onboardingStep: step })
  } catch (error) {
    return handleApiError(error)
  }
}
