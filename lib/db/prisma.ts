import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    transactionOptions: {
      maxWait: 10000, // 10s - time to wait for a connection from the pool (default: 2s)
      timeout: 15000, // 15s - max time transaction can run (default: 5s)
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
