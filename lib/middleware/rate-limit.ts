import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Generate key (default: IP address)
    const key = keyGenerator
      ? keyGenerator(req)
      : req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    const now = Date.now()
    const record = rateLimitStore.get(key)

    // Clean up expired records periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k)
        }
      }
    }

    if (!record || record.resetTime < now) {
      // Create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return null // Allow request
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(record.resetTime),
          },
        }
      )
    }

    // Increment count
    record.count++
    return null // Allow request
  }
}

/**
 * Rate limiter for auth endpoints (5 requests per minute)
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyGenerator: (req) => {
    // Use email from body if available, otherwise IP
    return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  },
})
