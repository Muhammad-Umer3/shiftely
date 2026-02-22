import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkPermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { addScheduleChatSystemMessage } from '@/lib/schedule-chat'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const swap = await prisma.slotSwap.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        slot: true,
        requester: true,
        targetEmployee: true,
      },
    })

    if (!swap) {
      return NextResponse.json({ message: 'Swap not found' }, { status: 404 })
    }

    const isRequesterOrTarget =
      swap.requesterId === user.id || swap.targetEmployeeId === user.id
    const canApproveAsManager = await checkPermission(PERMISSIONS.SWAP_APPROVE)
    if (!isRequesterOrTarget && !canApproveAsManager) {
      return NextResponse.json({ message: 'You cannot approve this swap' }, { status: 403 })
    }

    if (swap.status !== 'PENDING') {
      return NextResponse.json({ message: 'Swap already processed' }, { status: 400 })
    }

    // Update swap status
    const updatedSwap = await prisma.slotSwap.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    // Update slot assignment: replace requester's assignment with target employee
    if (swap.slotAssignmentId && swap.targetEmployeeId) {
      const targetEmployee = await prisma.employee.findFirst({
        where: { userId: swap.targetEmployeeId, organizationId: user.organizationId },
      })
      if (targetEmployee) {
        await prisma.slotAssignment.update({
          where: { id: swap.slotAssignmentId },
          data: { employeeId: targetEmployee.id },
        })
      }
    } else if (swap.slotAssignmentId) {
      // No target - just unassign (give away shift)
      await prisma.slotAssignment.update({
        where: { id: swap.slotAssignmentId },
        data: { employeeId: null },
      })
    }

    // Send notifications
    await NotificationService.notifySlotSwap(swap.id, 'approved')

    // Add system message to schedule chat
    await addScheduleChatSystemMessage(swap.slot.scheduleId, 'Shift swap approved.', {
      kind: 'swap_approved',
      swapId: swap.id,
    })

    return NextResponse.json({ swap: updatedSwap }, { status: 200 })
  } catch (error) {
    console.error('Error approving swap:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
