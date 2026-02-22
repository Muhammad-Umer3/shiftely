import { prisma } from '@/lib/db/prisma'

export type ScheduleChatSystemKind =
  | 'swap_requested'
  | 'swap_approved'
  | 'swap_rejected'

/**
 * Add a system message to a schedule's chat (e.g. swap events).
 * Call this after swap create/approve/reject so the schedule chat shows the activity.
 */
export async function addScheduleChatSystemMessage(
  scheduleId: string,
  body: string,
  metadata: { kind: ScheduleChatSystemKind; swapId: string }
) {
  await prisma.scheduleChatMessage.create({
    data: {
      scheduleId,
      body,
      type: 'system',
      metadata: metadata as object,
    },
  })
}
