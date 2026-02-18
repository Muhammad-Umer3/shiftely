'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, X } from 'lucide-react'

type Role = {
  id: string
  name: string
  description: string | null
  isSystemRole: boolean
}

type UserRole = {
  id: string
  role: Role
}

type UserWithRoles = {
  id: string
  name: string | null
  email: string
  userRoles: UserRole[]
}

interface UserRoleAssignmentProps {
  organizationId: string
}

export function UserRoleAssignment({ organizationId }: UserRoleAssignmentProps) {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      })

      if (response.ok) {
        await loadUsers()
        setSelectedRoleId('')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to assign role')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) return

    try {
      const response = await fetch(`/api/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadUsers()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to remove role')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const availableRoles = roles.filter(
    (role) => !selectedUser?.userRoles.some((ur) => ur.role.id === role.id)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Role Assignment</h2>
        <p className="text-muted-foreground">Assign roles to users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.name || user.email}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Assigned Roles:</p>
                {user.userRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                ) : (
                  <div className="space-y-2">
                    {user.userRoles.map((userRole) => (
                      <div
                        key={userRole.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">
                          {userRole.role.name}
                          {userRole.role.isSystemRole && (
                            <span className="ml-2 text-xs text-blue-600">(System)</span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRole(user.id, userRole.role.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  value={selectedRoleId}
                  onChange={(e) => {
                    setSelectedUser(user)
                    setSelectedRoleId(e.target.value)
                  }}
                >
                  <option value="">Select a role...</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    if (selectedRoleId) {
                      handleAssignRole(user.id, selectedRoleId)
                    }
                  }}
                  disabled={!selectedRoleId}
                >
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
