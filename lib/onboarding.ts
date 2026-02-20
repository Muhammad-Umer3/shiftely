import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export async function setOnboardingStep(
  organizationId: string,
  step: number
): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  })
  if (!organization) return

  const settings = (organization.settings as Record<string, unknown>) || {}
  if (settings.onboardingCompleted) return

  settings.onboardingStep = Math.min(5, Math.max(1, step))
  await prisma.organization.update({
    where: { id: organizationId },
    data: { settings: settings as Prisma.InputJsonValue },
  })
}

export async function completeOnboarding(organizationId: string): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  })
  if (!organization) return

  const settings = (organization.settings as Record<string, unknown>) || {}
  settings.onboardingCompleted = true
  settings.onboardingStep = 5
  await prisma.organization.update({
    where: { id: organizationId },
    data: { settings: settings as Prisma.InputJsonValue },
  })
}
