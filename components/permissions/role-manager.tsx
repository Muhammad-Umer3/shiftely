'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PermissionSelector } from './permission-selector'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Permission } from '@/lib/permissions/permissions'

type Role = {
  id: string
  name: string
  description: string | null
  isSystemRole: boolean
  rolePermissions: Array<{
    permission: {
      id: string
      resource: string
      action: string
    }
  }>
  _count: {
    userRoles: number
  }
}

interface RoleManagerProps {
  organizationId: string
}

export function RoleManager({ organizationId }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Array<{ id: string; resource: string; action: string }>>([])
  const [permissionMap, setPermissionMap] = useState<Map<string, { id: string; permission: Permission }>>(new Map())
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      const data = await response.json()
      setPermissions(data.permissions || [])
      
      // Create permission map
      const map = new Map<string, { id: string; permission: Permission }>()
      data.permissions.forEach((p: { id: string; resource: string; action: string }) => {
        const permission = `${p.resource}:${p.action}` as Permission
        map.set(p.id, { id: p.id, permission })
      })
      setPermissionMap(map)
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  const handleCreate = () => {
    setEditingRole(null)
    setIsCreating(true)
    setFormData({ name: '', description: '' })
    setSelectedPermissions([])
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setIsCreating(false)
    setFormData({ name: role.name, description: role.description || '' })
    setSelectedPermissions(role.rolePermissions.map((rp) => rp.permission.id))
  }

  const handleSave = async () => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissionIds: selectedPermissions,
        }),
      })

      if (response.ok) {
        await loadRoles()
        setEditingRole(null)
        setIsCreating(false)
        setFormData({ name: '', description: '' })
        setSelectedPermissions([])
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save role')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadRoles()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete role')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage roles and their permissions</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {(isCreating || editingRole) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? 'Edit Role' : 'Create Role'}</CardTitle>
            <CardDescription>
              {editingRole ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Shift Supervisor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do"
              />
            </div>
            {permissionMap.size > 0 && (
              <div className="space-y-2">
                <Label>Permissions</Label>
                <PermissionSelector
                  selectedPermissions={selectedPermissions}
                  onChange={setSelectedPermissions}
                  permissionMap={permissionMap}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Role</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRole(null)
                  setIsCreating(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{role.name}</CardTitle>
                {role.isSystemRole && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    System
                  </span>
                )}
              </div>
              {role.description && <CardDescription>{role.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {role.rolePermissions.length} permission(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  {role._count.userRoles} user(s) assigned
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    disabled={role.isSystemRole}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                    disabled={role.isSystemRole || role._count.userRoles > 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
