import 'next-auth'
import { Permission } from '@/lib/permissions/permissions'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      organizationId: string
      role: string
      permissions: Permission[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    organizationId: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    organizationId: string
    role: string
    permissions: Permission[]
  }
}
