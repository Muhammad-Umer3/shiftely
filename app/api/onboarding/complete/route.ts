import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Mark onboarding as complete in organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (organization.settings as Record<string, any>) || {}
    settings.onboardingCompleted = true

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        settings,
      },
    })

    return NextResponse.json({ message: 'Onboarding completed' }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
