'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PERMISSIONS_BY_RESOURCE, PERMISSION_DESCRIPTIONS } from '@/lib/permissions/permissions'
import { Permission } from '@/lib/permissions/permissions'

interface PermissionSelectorProps {
  selectedPermissions: string[]
  onChange: (permissionIds: string[]) => void
  permissionMap: Map<string, { id: string; permission: Permission }>
}

export function PermissionSelector({
  selectedPermissions,
  onChange,
  permissionMap,
}: PermissionSelectorProps) {
  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter((id) => id !== permissionId))
    } else {
      onChange([...selectedPermissions, permissionId])
    }
  }

  const toggleResource = (resource: string) => {
    const resourcePermissions = PERMISSIONS_BY_RESOURCE[resource] || []
    const resourcePermissionIds = resourcePermissions
      .map((p) => {
        const entry = Array.from(permissionMap.values()).find((e) => e.permission === p)
        return entry?.id
      })
      .filter((id): id is string => id !== undefined)

    const allSelected = resourcePermissionIds.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      // Deselect all
      onChange(selectedPermissions.filter((id) => !resourcePermissionIds.includes(id)))
    } else {
      // Select all
      const newSelection = [...selectedPermissions]
      resourcePermissionIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id)
        }
      })
      onChange(newSelection)
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSIONS_BY_RESOURCE).map(([resource, permissions]) => {
        const resourcePermissionIds = permissions
          .map((p) => {
            const entry = Array.from(permissionMap.values()).find((e) => e.permission === p)
            return entry?.id
          })
          .filter((id): id is string => id !== undefined)

        const allSelected = resourcePermissionIds.every((id) => selectedPermissions.includes(id))
        const someSelected = resourcePermissionIds.some((id) => selectedPermissions.includes(id))

        return (
          <Card key={resource}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{resource}</CardTitle>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => toggleResource(resource)}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = someSelected && !allSelected
                    }
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {permissions.map((permission) => {
                  const entry = Array.from(permissionMap.values()).find(
                    (e) => e.permission === permission
                  )
                  if (!entry) return null

                  return (
                    <div key={entry.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={entry.id}
                        checked={selectedPermissions.includes(entry.id)}
                        onCheckedChange={() => togglePermission(entry.id)}
                      />
                      <label
                        htmlFor={entry.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {PERMISSION_DESCRIPTIONS[permission] || permission}
                      </label>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
