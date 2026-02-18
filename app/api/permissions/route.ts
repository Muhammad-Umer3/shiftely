import { NextRequest, NextResponse } from 'next/server'
import { PermissionService } from '@/server/services/permissions/permission.service'

export async function GET(req: NextRequest) {
  try {
    const permissions = await PermissionService.getAllPermissions()

    return NextResponse.json({ permissions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
