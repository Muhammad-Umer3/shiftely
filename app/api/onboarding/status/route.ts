import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function GET() {
  try {
    const user = await requireAuth()

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (organization.settings as Record<string, unknown>) || {}
    const onboardingCompleted = Boolean(settings.onboardingCompleted)
    const rawStep = settings.onboardingStep
    const onboardingStep =
      typeof rawStep === 'number' && rawStep >= 1 && rawStep <= 5 ? rawStep : 1

    return NextResponse.json({
      onboardingCompleted,
      onboardingStep,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
