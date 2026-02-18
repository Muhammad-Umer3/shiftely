import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { ShiftSwapList } from '@/components/schedule/shift-swap-list'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export default async function SwapsPage() {
  const user = await requirePermission(PERMISSIONS.SWAP_VIEW)

  const swaps = await prisma.shiftSwap.findMany({
    where: {
      OR: [
        { requesterId: user.id },
        { targetEmployeeId: user.id },
      ],
    },
    include: {
      shift: {
        include: {
          employee: {
            include: { user: true },
          },
        },
      },
      requester: true,
      targetEmployee: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Swaps</h1>
        <p className="text-muted-foreground">Manage shift swap requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap Requests</CardTitle>
          <CardDescription>View and manage shift swap requests</CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftSwapList swaps={swaps} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
